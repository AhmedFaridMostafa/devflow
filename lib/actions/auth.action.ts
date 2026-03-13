"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import Account from "@/database/account.model";
import User from "@/database/user.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { SignInSchema, SignUpSchema } from "../validations";
import { ConflictError, UnauthorizedError } from "../http-errors";
import withTransaction from "../handlers/transaction";

export async function signUpWithCredentials(
  params: AuthCredentials,
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignUpSchema });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { name, username, email, password } = validationResult.params;
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await withTransaction(async (session) => {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      }).session(session);

      if (existingUser) {
        throw new ConflictError(
          existingUser.email === email
            ? "An account with this email already exists"
            : "This username is already taken",
        );
      }
      const [newUser] = await User.create([{ username, name, email }], {
        session,
      });
      await Account.create(
        [
          {
            userId: newUser._id,
            name,
            provider: "credentials",
            providerAccountId: email,
            password: hashedPassword,
          },
        ],
        { session },
      );
    });
  } catch (error) {
    return handleError(error);
  }
  await signIn("credentials", { email, password, redirect: false });
  return { success: true, data: null };
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">,
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignInSchema });

  if (validationResult instanceof Error) return handleError(validationResult);

  const { email, password } = validationResult.params;

  try {
    const account = await Account.findOne({
      provider: "credentials",
      providerAccountId: email,
    }).select<{ password: string }>("password");

    if (!account || !account.password)
      throw new UnauthorizedError("Invalid email or password");

    if (!account.password) throw new UnauthorizedError();

    const passwordMatch = await bcrypt.compare(password, account.password);

    if (!passwordMatch)
      throw new UnauthorizedError("Invalid email or password");

    await signIn("credentials", { email, password, redirect: false });
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}
