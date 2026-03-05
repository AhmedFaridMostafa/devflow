"use server";

import { IAnswerDoc } from "@/database/answer.model";

export async function createAnswer(
  params: CreateAnswerParams,
): Promise<ActionResponse<IAnswerDoc>> {
  console.log(params);

  return {
    success: true,
    data: JSON.parse(
      JSON.stringify({
        author: "Types.ObjectId",
        question: "Types.ObjectId",
        content: "string",
        upvotes: 0,
        downvotes: 0,
      }),
    ),
  };
}
