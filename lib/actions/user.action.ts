"use server";

import { QueryFilter } from "mongoose";

import { User } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";

import { PaginatedSearchParamsSchema } from "../validations";
import { serialize } from "../utils";

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
