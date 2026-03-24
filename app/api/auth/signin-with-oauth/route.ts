import { NextResponse } from "next/server";
import slugify from "slugify";

import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError, { getZodFieldErrors } from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validations";
import withTransaction from "@/lib/handlers/transaction";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  try {
    const validatedData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success)
      throw new ValidationError(getZodFieldErrors(validatedData.error));

    const { name, username, email, image } = user;

    const slugifyUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!slugifyUsername)
      throw new ValidationError({
        username: [
          "Username could not be generated. Please provide a valid username.",
        ],
      });

    await dbConnect();
    await withTransaction(async (session) => {
      let existingUser = await User.findOne({ email }).session(session);

      if (!existingUser) {
        [existingUser] = await User.create(
          [{ name, username: slugifyUsername, email, image }],
          { session },
        );
      } else {
        const updatedData: { name?: string; image?: string } = {};

        if (existingUser.name !== name) updatedData.name = name;
        if (existingUser.image !== image) updatedData.image = image;

        if (Object.keys(updatedData).length > 0) {
          await User.updateOne(
            { _id: existingUser._id },
            { $set: updatedData },
            { session },
          );
        }
      }

      const existingAccount = await Account.findOne({
        userId: existingUser._id,
        provider,
        providerAccountId,
      }).session(session);

      if (!existingAccount) {
        await Account.create(
          [
            {
              userId: existingUser._id,
              name,
              image,
              provider,
              providerAccountId,
            },
          ],
          { session },
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleError(error, "api");
  }
}
