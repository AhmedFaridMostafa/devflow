"use server";

import mongoose, { ClientSession } from "mongoose";
import { revalidatePath } from "next/cache";

import { Answer, Question } from "@/database";
import Vote from "@/database/vote.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from "../validations";

export async function hasVoted(
  params: HasVotedParams,
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

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
    return handleError(error) as ErrorResponse;
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
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params;

  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    const result = await (Model as typeof Question).findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session },
    );

    if (!result) throw new Error("Failed to update vote count");

    return { success: true, data: null };
  } catch (error) {
    return handleError(error) as ErrorResponse;
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
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params;
  const userId = validationResult.session.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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
        updateVoteCount({ targetId, targetType, voteType, change: 1 }, session),
        // Decrement the OLD vote type  ← was incorrectly using `voteType` here
        updateVoteCount(
          { targetId, targetType, voteType: existingVote.voteType, change: -1 },
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
        updateVoteCount({ targetId, targetType, voteType, change: 1 }, session),
      ]);
    }

    await session.commitTransaction();

    revalidatePath(`/questions/${targetId}`);
    return { success: true, data: null };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
