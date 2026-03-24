"use server";

import { Types, type QueryFilter } from "mongoose";

import Question, { type IQuestion } from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AskQuestionSchema,
  DeleteQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import { type Serialize, serialize } from "../utils";
import { revalidatePath, cacheTag, updateTag, cacheLife } from "next/cache";
import ROUTES from "@/constants/routes";
import withTransaction from "../handlers/transaction";
import { UnauthorizedError } from "../http-errors";
import { Answer, Collection, Interaction, Vote } from "@/database";
import { after } from "next/server";
import { createInteraction } from "./interaction.action";
import { auth } from "@/auth";
import { cache } from "react";

export async function createQuestion(
  params: CreateQuestionParams,
): Promise<ActionResponse<Serialize<IQuestion & { _id: Types.ObjectId }>>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { title, content, tags } = validationResult.params;
  const userId = validationResult.session.user.id;

  try {
    const question = await withTransaction(async (dbSession) => {
      const tagDocs = (
        await Promise.all(
          tags.map((tag) =>
            Tag.findOneAndUpdate(
              { name: tag },
              { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
              { upsert: true, new: true, session: dbSession },
            ),
          ),
        )
      ).filter((doc): doc is NonNullable<typeof doc> => doc !== null);

      const tagIds = tagDocs.map((tag) => tag._id);

      const [question] = await Question.create(
        [{ title, content, author: userId, tags: tagIds }],
        { session: dbSession },
      );
      if (!question) throw new Error("Failed to create question");

      await TagQuestion.insertMany(
        tagIds.map((tagId) => ({ tag: tagId, question: question._id })),
        { session: dbSession },
      );

      return question;
    });

    after(async () => {
      try {
        await createInteraction({
          action: "post",
          actionId: question._id.toString(),
          actionTarget: "question",
          authorId: userId,
        });
      } catch (error) {
        console.error("Failed to log interaction:", error);
      }
    });

    updateTag("hot-questions");
    updateTag("top-tags");

    return { success: true, data: serialize(question) };
  } catch (error) {
    return handleError(error);
  }
}

export async function editQuestion(
  params: EditQuestionParams,
): Promise<ActionResponse<Serialize<IQuestion & { _id: Types.ObjectId }>>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { title, content, tags, questionId } = validationResult.params;
  const userId = validationResult.session.user.id;

  try {
    await withTransaction(async (session) => {
      const question = await Question.findById(questionId)
        .select("author tags")
        .session(session)
        .lean();

      if (!question) throw new Error("Question not found");

      if (question.author.toString() !== userId)
        throw new UnauthorizedError("Not authorized");

      const existingTagDocs = await Tag.find({ _id: { $in: question.tags } })
        .select("name")
        .session(session)
        .lean();

      const existingTagNames = existingTagDocs.map((t) => t.name);
      const tagsToAdd = tags.filter((tag) => !existingTagNames.includes(tag));
      const tagsToRemove = existingTagNames.filter(
        (tag) => !tags.includes(tag),
      );

      const upsertedTags = (
        await Promise.all(
          tagsToAdd.map((tag) =>
            Tag.findOneAndUpdate(
              { name: tag },
              { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
              { upsert: true, new: true, session },
            ),
          ),
        )
      ).filter((doc): doc is NonNullable<typeof doc> => doc !== null);

      const tagIdsToAdd = upsertedTags.map((t) => t._id);
      const tagIdsToRemove = existingTagDocs
        .filter((t) => tagsToRemove.includes(t.name))
        .map((t) => t._id);

      await Question.updateOne(
        { _id: questionId },
        {
          $set: { title, content },
          $addToSet: { tags: { $each: tagIdsToAdd } },
          $pull: { tags: { $in: tagIdsToRemove } },
        },
        { session },
      );

      await Promise.all([
        tagIdsToRemove.length > 0 &&
          Tag.updateMany(
            { _id: { $in: tagIdsToRemove } },
            { $inc: { questions: -1 } },
            { session },
          ),
        tagIdsToAdd.length > 0 &&
          TagQuestion.insertMany(
            tagIdsToAdd.map((tagId) => ({ tag: tagId, question: questionId })),
            { session },
          ),
        tagIdsToRemove.length > 0 &&
          TagQuestion.deleteMany(
            { tag: { $in: tagIdsToRemove }, question: questionId },
            { session },
          ),
      ]);
    });

    const updatedQuestion = await Question.findById(questionId).lean();
    if (!updatedQuestion) throw new Error("Question not found after update");

    return { success: true, data: serialize(updatedQuestion) };
  } catch (error) {
    return handleError(error);
  }
}

export const getQuestion = cache(async function getQuestion(
  params: GetQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { questionId } = validationResult.params;

  try {
    const question = await Question.findById(questionId)
      .populate<{ tags: Tag[] }>("tags", "name")
      .populate<{ author: Author }>("author", "name image")
      .lean();

    if (!question) throw new Error("Question not found");

    return { success: true, data: serialize(question) };
  } catch (error) {
    return handleError(error);
  }
});

async function getRecommendedQuestions({
  userId,
  query,
  skip,
  limit,
}: RecommendationParams): Promise<{ questions: Question[]; isNext: boolean }> {
  const interactions = await Interaction.find({
    user: new Types.ObjectId(userId),
    actionType: "question",
    action: { $in: ["view", "upvote", "bookmark", "post"] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const interactedQuestionIds = interactions.map((i) => i.actionId);

  const interactedQuestions = await Question.find({
    _id: { $in: interactedQuestionIds },
  }).select<{ tags: Types.ObjectId[] }>("tags");

  const allTags = interactedQuestions.flatMap((q) =>
    q.tags.map((tag) => tag.toString()),
  );

  const uniqueTagIds = [...new Set(allTags)];

  const recommendedQuery: QueryFilter<typeof Question> = {
    _id: { $nin: interactedQuestionIds },
    author: { $ne: new Types.ObjectId(userId) },
    tags: { $in: uniqueTagIds.map((id) => new Types.ObjectId(id)) },
  };

  if (query) {
    recommendedQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ];
  }

  const [totalQuestions, questions] = await Promise.all([
    Question.countDocuments(recommendedQuery),
    Question.find(recommendedQuery)
      .populate<{ tags: Tag[] }>("tags", "name")
      .populate<{ author: Author }>("author", "name image")
      .sort({ upvotes: -1, views: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    questions: serialize(questions),
    isNext: totalQuestions > skip + questions.length,
  };
}

export async function getQuestions(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { pageSize, query, filter, skip } = validationResult.params;

  const filterQuery: QueryFilter<typeof Question> = {};

  if (filter === "recommended") {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId)
      return { success: true, data: { questions: [], isNext: false } };

    const data = await getRecommendedQuestions({
      userId,
      query,
      skip,
      limit: pageSize,
    });

    return { success: true, data };
  }

  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "unanswered":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const [totalQuestions, questions] = await Promise.all([
      Question.countDocuments(filterQuery),
      Question.find(filterQuery)
        .populate<{ tags: Tag[] }>("tags", "name")
        .populate<{ author: Author }>("author", "name image")
        .sort(sortCriteria)
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: { questions: serialize(questions), isNext },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function incrementViews(
  params: IncrementViewsParams,
): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { questionId } = validationResult.params;

  try {
    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } },
      { new: true },
    ).select("views");

    if (!question) throw new Error("Question not found");

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: { views: question.views },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getHotQuestions(): Promise<
  ActionResponse<HotQuestion[]>
> {
  "use cache";
  cacheLife("hours");
  cacheTag("hot-questions");
  const validationResult = await action({});
  if (validationResult instanceof Error) return handleError(validationResult);
  try {
    const questions = await Question.aggregate<Question>([
      {
        $addFields: {
          hotScore: { $add: ["$views", { $multiply: ["$upvotes", 5] }] },
        },
      },
      { $sort: { hotScore: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          title: 1,
        },
      },
    ]);

    return {
      success: true,
      data: serialize(questions),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteQuestion(
  params: DeleteQuestionParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { questionId } = validationResult.params;
  const { user } = validationResult.session;

  try {
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    if (question.author.toString() !== user.id)
      throw new Error("You are not authorized to delete this question");

    await withTransaction(async (session) => {
      const answerIds = (await Answer.distinct("_id", {
        question: questionId,
      }).session(session)) as Types.ObjectId[];

      await Promise.all([
        Collection.deleteMany({ question: questionId }).session(session),
        TagQuestion.deleteMany({ question: questionId }).session(session),
        Vote.deleteMany({
          actionId: questionId,
          actionType: "question",
        }).session(session),
        Answer.deleteMany({ question: questionId }).session(session),
        ...(question.tags.length > 0
          ? [
              Tag.updateMany(
                { _id: { $in: question.tags } },
                { $inc: { questions: -1 } },
                { session },
              ),
            ]
          : []),
        ...(answerIds.length > 0
          ? [
              Vote.deleteMany({
                actionId: { $in: answerIds },
                actionType: "answer",
              }).session(session),
            ]
          : []),
        Question.findByIdAndDelete(questionId).session(session),
      ]);
    });

    after(async () => {
      try {
        await createInteraction({
          action: "delete",
          actionId: questionId,
          actionTarget: "question",
          authorId: user.id,
        });
      } catch (error) {
        console.error("Failed to log interaction:", error);
      }
    });

    revalidatePath(`/profile/${user.id}`);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}
