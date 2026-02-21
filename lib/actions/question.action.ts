"use server";

import mongoose from "mongoose";

import Question from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { AskQuestionSchema } from "../validations";

export async function createQuestion(
  params: CreateQuestionParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { title, content, tags } = validationResult.params;
  const userId = validationResult.session.user!.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tagDocs = await Promise.all(
      tags.map((tag) =>
        Tag.findOneAndUpdate(
          { name: tag },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session },
        ),
      ),
    );

    const tagIds = tagDocs.map((tag) => tag._id);

    const [question] = await Question.create(
      [{ title, content, author: userId, tags: tagIds }],
      { session },
    );

    if (!question) throw new Error("Failed to create question");

    await TagQuestion.insertMany(
      tagIds.map((tagId) => ({
        tag: tagId,
        question: question._id,
      })),
      { session },
    );

    await session.commitTransaction();

    return { success: true, data: question.toObject() };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
