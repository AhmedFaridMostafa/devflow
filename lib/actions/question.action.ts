"use server";

import { type Types, type QueryFilter } from "mongoose";

import Question, { type IQuestion } from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import { type Serialize, serialize } from "../utils";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import withTransaction from "../handlers/transaction";
import { UnauthorizedError } from "../http-errors";
import dbConnect from "../mongoose";

export async function createQuestion(
  params: CreateQuestionParams,
): Promise<ActionResponse<Serialize<IQuestion & { _id: Types.ObjectId }>>> {
  // 1️⃣ Validate input and authorize user
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
      // 3️⃣ Upsert tags: create new tags if not exist, increment questions count
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

      // 4️⃣ Create the question document and link it to tags
      const [question] = await Question.create(
        [{ title, content, author: userId, tags: tagIds }],
        { session: dbSession },
      );
      if (!question) throw new Error("Failed to create question");

      // 5️⃣ Insert into TagQuestion pivot table for many-to-many relationship
      await TagQuestion.insertMany(
        tagIds.map((tagId) => ({
          tag: tagId,
          question: question._id,
        })),
        { session: dbSession },
      );
      return question;
    });
    return { success: true, data: serialize(question) };
  } catch (error) {
    return handleError(error);
  }
}

export async function editQuestion(
  params: EditQuestionParams,
): Promise<ActionResponse<Serialize<IQuestion & { _id: Types.ObjectId }>>> {
  // 1️⃣ Validate input and authorize user
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
      // 3️⃣ Fetch minimal question data (author and existing tags)
      const question = await Question.findById(questionId)
        .select("author tags")
        .session(session)
        .lean();

      if (!question) throw new Error("Question not found");

      // 4️⃣ Authorization check: only the author can edit
      if (question.author.toString() !== userId)
        throw new UnauthorizedError("Not authorized");

      // 5️⃣ Get current tags linked to question
      const existingTagDocs = await Tag.find({
        _id: { $in: question.tags },
      })
        .select("name")
        .session(session)
        .lean();

      const existingTagNames = existingTagDocs.map((t) => t.name);

      // 6️⃣ Determine which tags to add and which to remove
      const tagsToAdd = tags.filter((tag) => !existingTagNames.includes(tag));
      const tagsToRemove = existingTagNames.filter(
        (tag) => !tags.includes(tag),
      );

      // 7️⃣ Upsert new tags and increment their question counts
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

      const tagIdsToAdd = upsertedTags.map((t) => t!._id);

      // 8️⃣ Get IDs of tags to remove
      const tagIdsToRemove = existingTagDocs
        .filter((t) => tagsToRemove.includes(t.name))
        .map((t) => t._id);

      // 9️⃣ Atomic update of the question document
      await Question.updateOne(
        { _id: questionId },
        {
          $set: { title, content },
          $addToSet: { tags: { $each: tagIdsToAdd } },
          $pull: { tags: { $in: tagIdsToRemove } },
        },
        { session },
      );

      // 🔟 Decrement questions count of removed tags
      if (tagIdsToRemove.length) {
        await Tag.updateMany(
          { _id: { $in: tagIdsToRemove } },
          { $inc: { questions: -1 } },
          { session },
        );
      }

      // 1️⃣1️⃣ Update TagQuestion pivot table
      if (tagIdsToAdd.length) {
        await TagQuestion.insertMany(
          tagIdsToAdd.map((tagId) => ({
            tag: tagId,
            question: questionId,
          })),
          { session },
        );
      }

      if (tagIdsToRemove.length) {
        await TagQuestion.deleteMany(
          { tag: { $in: tagIdsToRemove }, question: questionId },
          { session },
        );
      }
    });

    // 1️⃣3️⃣ Fetch and return updated question
    const updatedQuestion = await Question.findById(questionId).lean();
    if (!updatedQuestion) throw new Error("Question not found after update");

    return { success: true, data: serialize(updatedQuestion) };
  } catch (error) {
    return handleError(error);
  }
}

export async function getQuestion(
  params: GetQuestionParams,
): Promise<ActionResponse<Question>> {
  // 1️⃣ Validate input and authorize user
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { questionId } = validationResult.params;

  try {
    // 2️⃣ Fetch question and populate tags
    const question = await Question.findById(questionId)
      .populate<{ tags: Tag[] }>("tags", "name")
      .populate<{ author: Author }>("author", "name image")
      .lean();

    if (!question) throw new Error("Question not found");

    // 3️⃣ Return the question
    return { success: true, data: serialize(question) };
  } catch (error) {
    // 4️⃣ Handle errors consistently
    return handleError(error);
  }
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
    return { success: true, data: { questions: [], isNext: false } };
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
        .lean()
        .sort(sortCriteria)
        .skip(skip)
        .limit(pageSize),
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
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    question.views += 1;
    await question.save();

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
  try {
    await dbConnect();
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
