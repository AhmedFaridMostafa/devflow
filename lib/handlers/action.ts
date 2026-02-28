"use server";

import { Session } from "next-auth";
import z, { ZodError } from "zod";

import { auth } from "@/auth";
import { UnauthorizedError, ValidationError } from "../http-errors";
import dbConnect from "../mongoose";
import { getZodFieldErrors } from "./error";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthorizedSession = Omit<Session, "user"> & {
  user: NonNullable<Session["user"]>;
};

// Discriminated union — forces params when schema is given, forbids both otherwise
type ActionOptions<S extends z.ZodType, A extends boolean> =
  | { schema: S; params: z.input<S>; authorize?: A }
  | { schema?: never; params?: never; authorize?: A };

// Return params type mirrors whether a schema was supplied
type ResolvedParams<S extends z.ZodType | never> = [S] extends [z.ZodType]
  ? z.output<S>
  : undefined;

interface ActionSuccess<S extends z.ZodType | never, A extends boolean> {
  params: ResolvedParams<S>;
  session: A extends true ? AuthorizedSession : null;
}

type ActionResult<S extends z.ZodType | never, A extends boolean> =
  | ActionSuccess<S, A>
  | Error;

// ─── Implementation ───────────────────────────────────────────────────────────

async function action<S extends z.ZodType, A extends boolean = false>(
  options: ActionOptions<S, A>,
): Promise<ActionResult<S, A>> {
  const { params, schema, authorize = false as A } = options;

  let parsedParams: z.output<S> | undefined;

  if (schema) {
    try {
      parsedParams = schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(getZodFieldErrors(error));
      }
      return new Error("Schema validation failed");
    }
  }

  let session: AuthorizedSession | null = null;

  if (authorize) {
    const rawSession = await auth();
    if (!rawSession?.user) return new UnauthorizedError();
    session = rawSession as AuthorizedSession;
  }

  await dbConnect();

  return {
    params: parsedParams,
    session: session,
  } as ActionSuccess<S, A>;
}

export default action;
