"use server";
import { type ClientSession, type Model as MongooseModel } from "mongoose";
import type { IQuestion } from "@/database/question.model";
import type { IAnswer } from "@/database/answer.model";
import { Answer, Question } from "@/database";
import Vote from "@/database/vote.model";
import withTransaction from "../handlers/transaction";

import { revalidatePath } from "next/cache";
import action from "../handlers/action";
import handleError from "../handlers/error";

import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from "../validations";
import { after } from "next/server";
import { createInteraction } from "./interaction.action";
type TargetModel = MongooseModel<IQuestion | IAnswer>;
export async function hasVoted(
  params: HasVotedParams,
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { targetId, targetType } = validationResult.params;
  const userId = validationResult.session.user.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote)
      return {
        success: false,
        status: 404,
        error: { message: "No vote found" },
      };

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateVoteCount(
  params: UpdateVoteCountParams,
  session: ClientSession,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateVoteCountSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult);
  }

  const { targetId, targetType, voteType, change } = validationResult.params;

  const Model: TargetModel = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    const result = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session },
    );

    if (!result) throw new Error("Failed to update vote count");

    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function createVote(
  params: CreateVoteParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult);
  }

  const { targetId, targetType, voteType } = validationResult.params;
  const userId = validationResult.session.user.id;

  try {
    const Model: TargetModel = targetType === "question" ? Question : Answer;
    const contentDoc = await Model.findById(targetId);
    if (!contentDoc) throw new Error("Content not found");
    const contentAuthorId = contentDoc.author.toString();

    await withTransaction(async (session) => {
      const existingVote = await Vote.findOne({
        author: userId,
        actionId: targetId,
        actionType: targetType,
      }).session(session);

      if (existingVote && existingVote.voteType === voteType) {
        // Same vote type → toggle off (remove the vote)
        await Promise.all([
          Vote.deleteOne({ _id: existingVote._id }).session(session),
          updateVoteCount(
            { targetId, targetType, voteType, change: -1 },
            session,
          ),
        ]);
      } else if (existingVote) {
        // Different vote type → switch the vote
        await Promise.all([
          Vote.findByIdAndUpdate(
            existingVote._id,
            { voteType },
            { new: true, session },
          ),
          // Increment the new vote type
          updateVoteCount(
            { targetId, targetType, voteType, change: 1 },
            session,
          ),
          // Decrement the OLD vote type  ← was incorrectly using `voteType` here
          updateVoteCount(
            {
              targetId,
              targetType,
              voteType: existingVote.voteType,
              change: -1,
            },
            session,
          ),
        ]);
      } else {
        // No existing vote → first-time creation
        await Promise.all([
          Vote.create(
            [
              {
                author: userId,
                actionId: targetId,
                actionType: targetType,
                voteType,
              },
            ],
            { session },
          ),
          updateVoteCount(
            { targetId, targetType, voteType, change: 1 },
            session,
          ),
        ]);
      }
      // log the interaction
      after(async () => {
        try {
          await createInteraction({
            action: voteType,
            actionId: targetId,
            actionTarget: targetType,
            authorId: contentAuthorId,
          });
        } catch (error) {
          console.error("Failed to log interaction:", error);
        }
      });
    });

    revalidatePath(`/questions/${targetId}`);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}
