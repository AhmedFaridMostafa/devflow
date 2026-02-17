"use server";

import { Session } from "next-auth";
import z, { ZodError } from "zod";

import { auth } from "@/auth";

import { UnauthorizedError, ValidationError } from "../http-errors";
import dbConnect from "../mongoose";
import { getZodFieldErrors } from "./error";

type ActionOptions<S extends z.ZodType> = {
  schema?: S;
  params?: z.infer<S>;
  authorize?: boolean;
};

type ActionSuccess<S extends z.ZodType | undefined> = {
  params: S extends z.ZodType ? z.infer<S> : undefined;
  session: Session | null;
};

type ActionResult<S extends z.ZodType> = ActionSuccess<S> | Error;

async function action<S extends z.ZodType>({
  params,
  schema,
  authorize = false,
}: ActionOptions<S>): Promise<ActionResult<S>> {
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
    if (!session) return new UnauthorizedError();
  }

  await dbConnect();

  return { params, session } as ActionSuccess<S>;
}

export default action;
