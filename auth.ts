import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { api } from "./lib/api";
import Credentials from "next-auth/providers/credentials";
import { SignInSchema } from "./lib/validations";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;

        const existingAccount = await api.accounts.getByProvider(email);

        if (!existingAccount.success) return null;

        const existingUser = await api.users.getById(
          existingAccount.data.userId.toString(),
        );

        if (!existingUser.success) return null;

        const isValidPassword = await bcrypt.compare(
          password,
          existingAccount.data.password!,
        );

        if (isValidPassword) {
          return {
            id: existingUser.data._id.toString(),
            name: existingUser.data.name,
            email: existingUser.data.email,
            image: existingUser.data.image,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        const existingAccount = await api.accounts.getByProvider(
          account.type === "credentials"
            ? token.email!
            : account.providerAccountId,
        );

        if (!existingAccount.success) return token;

        const userId = existingAccount.data.userId;

        if (userId) token.sub = userId.toString();
      }

      return token;
    },
    async signIn({ user, profile, account }) {
      if (account?.type === "credentials") return true;
      if (!account || !user) return false;

      const username =
        account.provider === "github"
          ? (profile?.login as string)
          : (user.name?.toLowerCase() as string);

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
        username,
      };

      const { success } = (await api.auth.oAuthSignIn({
        user: userInfo,
        provider: account.provider as AuthProvider,
        providerAccountId: account.providerAccountId,
      })) as ActionResponse;

      if (!success) return false;

      return true;
    },
  },
});
