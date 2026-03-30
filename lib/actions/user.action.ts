"use server";

import { PipelineStage, QueryFilter, Types } from "mongoose";

import { Answer, Question, User } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";

import {
  GetUserQuestionsSchema,
  GetUsersAnswersSchema,
  GetUserSchema,
  GetUserTagsSchema,
  PaginatedSearchParamsSchema,
  UpdateProfileSchema,
} from "../validations";
import { assignBadges, serialize } from "../utils";
import { UnauthorizedError } from "../http-errors";

export async function getUsers(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    users: User[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });
  if (validationResult instanceof Error) return handleError(validationResult);

  const { skip, pageSize, query, filter } = validationResult.params;

  const filterQuery: QueryFilter<typeof User> = {};

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  const SORT_OPTIONS: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { reputation: -1 },
  };

  const sortCriteria = SORT_OPTIONS[filter || "newest"];

  try {
    const [totalUsers, users] = await Promise.all([
      User.countDocuments(filterQuery),
      User.find(filterQuery)
        .lean()
        .sort(sortCriteria)
        .skip(skip)
        .limit(pageSize),
    ]);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: {
        users: serialize(users),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getUser(
  params: GetUserParams,
): Promise<ActionResponse<{ user: User }>> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { userId } = params;

  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    return {
      success: true,
      data: {
        user: serialize(user),
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getUserQuestions(
  params: GetUserQuestionsParams,
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetUserQuestionsSchema,
  });
  if (validationResult instanceof Error) return handleError(validationResult);
  const { skip, pageSize, userId } = validationResult.params;
  try {
    const [totalQuestions, questions] = await Promise.all([
      Question.countDocuments({ author: userId }),
      Question.find({ author: userId })
        .populate<{ tags: Tag[] }>("tags", "name")
        .populate<{ author: Author }>("author", "name image")
        .skip(skip)
        .limit(pageSize),
    ]);
    return {
      success: true,
      data: {
        questions: serialize(questions),
        isNext: totalQuestions > skip + questions.length,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getUserAnswers(
  params: GetUserAnswersParams,
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetUsersAnswersSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { skip, pageSize, userId } = validationResult.params;

  try {
    const [totalAnswers, answers] = await Promise.all([
      Answer.countDocuments({ author: userId }),
      Answer.find({ author: userId })
        .populate<{ author: Author }>("author", "_id name image")
        .skip(skip)
        .limit(pageSize),
    ]);

    return {
      success: true,
      data: {
        answers: serialize(answers),
        isNext: totalAnswers > skip + answers.length,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getUserTopTags(
  params: GetUserTagsParams,
): Promise<ActionResponse<{ tags: (Tag & { count: number })[] }>> {
  const validationResult = await action({ params, schema: GetUserTagsSchema });
  if (validationResult instanceof Error) return handleError(validationResult);

  const { userId } = validationResult.params;

  const pipeline: PipelineStage[] = [
    { $match: { author: new Types.ObjectId(userId) } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "tags",
        localField: "_id",
        foreignField: "_id",
        as: "tagInfo",
      },
    },
    { $unwind: "$tagInfo" },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { _id: "$tagInfo._id", name: "$tagInfo.name", count: 1 } },
  ];

  try {
    const tags = await Question.aggregate<Tag & { count: number }>(pipeline);
    return {
      success: true,
      data: { tags: serialize(tags) },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getUserStats(params: GetUserParams): Promise<
  ActionResponse<{
    totalQuestions: number;
    totalAnswers: number;
    badges: Badges;
  }>
> {
  const validationResult = await action({ params, schema: GetUserSchema });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { userId } = validationResult.params;

  try {
    const [questionStats, answerStats] = await Promise.all([
      Question.aggregate([
        { $match: { author: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            upvotes: { $sum: "$upvotes" },
            views: { $sum: "$views" },
          },
        },
      ]),
      Answer.aggregate([
        { $match: { author: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            upvotes: { $sum: "$upvotes" },
          },
        },
      ]),
    ]);

    // Aggregation returns [] when no documents match — fall back to zero values
    const {
      count: questionCount = 0,
      upvotes: questionUpvotes = 0,
      views = 0,
    } = questionStats[0] ?? {};
    const { count: answerCount = 0, upvotes: answerUpvotes = 0 } =
      answerStats[0] ?? {};

    const badges = assignBadges({
      criteria: [
        { type: "ANSWER_COUNT", count: answerCount },
        { type: "QUESTION_COUNT", count: questionCount },
        { type: "QUESTION_UPVOTES", count: questionUpvotes + answerUpvotes },
        { type: "TOTAL_VIEWS", count: views },
      ],
    });

    return {
      success: true,
      data: {
        totalQuestions: questionCount,
        totalAnswers: answerCount,
        badges,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateProfile(
  params: UpdateProfileParams,
): Promise<ActionResponse<User>> {
  const validationResult = await action({
    params,
    schema: UpdateProfileSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { userId, ...data } = validationResult.params;

  if (userId !== validationResult.session.user.id)
    throw new UnauthorizedError();

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...data,
      },
      { new: true },
    );

    if (!user) throw new Error("User not found");

    return {
      success: true,
      data: serialize(user),
    };
  } catch (error) {
    return handleError(error);
  }
}
