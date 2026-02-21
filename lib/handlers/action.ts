"use server";

import { Session } from "next-auth";
import z, { ZodError } from "zod";

import { auth } from "@/auth";

import { UnauthorizedError, ValidationError } from "../http-errors";
import dbConnect from "../mongoose";
import { getZodFieldErrors } from "./error";

type ActionOptions<S extends z.ZodType, A extends boolean> = {
  schema?: S;
  params?: z.infer<S>;
  authorize?: A;
};

type ActionSuccess<
  S extends z.ZodType | undefined,
  A extends boolean | undefined,
> = {
  params: S extends z.ZodType ? z.infer<S> : undefined;
  session: A extends true ? Session : null;
};

type ActionResult<S extends z.ZodType, A extends boolean> =
  | ActionSuccess<S, A>
  | Error;

async function action<S extends z.ZodType, A extends boolean>({
  params,
  schema,
  authorize = false as A,
}: ActionOptions<S, A>): Promise<ActionResult<S, A>> {
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(getZodFieldErrors(error));
      } else {
        return new Error("Schema validation failed");
      }
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();
    if (!session || session.user) return new UnauthorizedError();
  }

  await dbConnect();

  return { params, session } as ActionSuccess<S, A>;
}

export default action;
