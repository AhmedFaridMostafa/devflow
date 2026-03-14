import { QueryFilter } from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  GetTagQuestionsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import { Question, Tag } from "@/database";
import { serialize } from "../utils";
import dbConnect from "../mongoose";

export const getTags = async (
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ tags: Tag[]; isNext: boolean }>> => {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { pageSize, query, filter, skip } = validationResult.params;

  const filterQuery: QueryFilter<typeof Tag> = {};

  if (query) {
    filterQuery.$or = [{ name: { $regex: query, $options: "i" } }];
  }

  let sortCriteria = {};

  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "recent":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = { questions: -1 };
      break;
  }

  try {
    const [totalTags, tags] = await Promise.all([
      Tag.countDocuments(filterQuery),
      Tag.find(filterQuery)
        .lean()
        .sort(sortCriteria)
        .skip(skip)
        .limit(pageSize),
    ]);

    const isNext = totalTags > skip + tags.length;

    return {
      success: true,
      data: {
        tags: serialize(tags),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getTagQuestions = async (
  params: GetTagQuestionsParams,
): Promise<
  ActionResponse<{ tag: Tag; questions: Question[]; isNext: boolean }>
> => {
  const validationResult = await action({
    params,
    schema: GetTagQuestionsSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { tagId, skip, pageSize = 10, query } = validationResult.params;

  try {
    const tag = await Tag.findById(tagId).lean();
    if (!tag) throw new Error("Tag not found");

    const filterQuery: QueryFilter<typeof Question> = {
      tags: { $in: [tagId] },
    };

    if (query) {
      filterQuery.title = { $regex: query, $options: "i" };
    }

    const [totalQuestions, questions] = await Promise.all([
      Question.countDocuments(filterQuery),
      Question.find(filterQuery)
        .select("_id title views answers upvotes downvotes author createdAt")
        .populate<{ author: Author; tags: Tag[] }>([
          { path: "author", select: "name image" },
          { path: "tags", select: "name" },
        ])
        .lean()
        .skip(skip)
        .limit(pageSize),
    ]);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        tag: serialize(tag),
        questions: serialize(questions),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getTopTags = async (): Promise<ActionResponse<Tag[]>> => {
  try {
    await dbConnect();

    const tags = await Tag.find().sort({ questions: -1 }).limit(5);

    return {
      success: true,
      data: serialize(tags),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
