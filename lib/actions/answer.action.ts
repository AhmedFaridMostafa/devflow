"use server";

import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import { Question } from "@/database";
import Answer, { IAnswerDoc } from "@/database/answer.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { AnswerServerSchema, GetAnswersSchema } from "../validations";
import { serialize, type Serialize } from "../utils";
import withTransaction from "../handlers/transaction";

export async function createAnswer(
  params: CreateAnswerParams,
): Promise<ActionResponse<Serialize<IAnswerDoc>>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { content, questionId } = validationResult.params;
  const userId = validationResult.session.user.id;

  try {
    const newAnswer = await withTransaction(async (session) => {
      const question = await Question.findById(questionId);

      if (!question) throw new Error("Question not found");

      const [newAnswer] = await Answer.create(
        [
          {
            author: userId,
            question: questionId,
            content,
          },
        ],
        { session },
      );

      if (!newAnswer) throw new Error("Failed to create answer");

      question.answers += 1;
      await question.save({ session });

      return newAnswer;
    });

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: serialize(newAnswer),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getAnswers(params: GetAnswersParams): Promise<
  ActionResponse<{
    answers: Answer[];
    isNext: boolean;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { questionId, skip, pageSize, filter } = validationResult.params;

  let sortCriteria = {};

  switch (filter) {
    case "latest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const [totalAnswers, answers] = await Promise.all([
      Answer.countDocuments({ question: questionId }),
      Answer.find({ question: questionId })
        .populate<{ author: Author }>("author", "name image")
        .lean()
        .sort(sortCriteria)
        .skip(skip)
        .limit(pageSize),
    ]);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: serialize(answers),
        isNext,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
