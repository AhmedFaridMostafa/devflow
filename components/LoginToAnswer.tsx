import Link from "next/link";
import ROUTES from "@/constants/routes";

const LoginToAnswer = () => (
  <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-dark-500/20 bg-dark-500/5 p-4 dark:border-dark-500/40 dark:bg-dark-500/10">
    <div className="flex-1">
      <p className="paragraph-semibold text-dark200_light900">
        Want to answer this question?
      </p>
      <p className="small-regular text-dark400_light700">
        Please sign in or create an account to share your knowledge.
      </p>
    </div>

    <div className="flex items-center gap-2">
      <Link
        href={ROUTES.SIGN_IN}
        className="rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-light-900 hover:bg-primary-600">
        Log in
      </Link>
      <Link
        href={ROUTES.SIGN_UP}
        className="rounded-md border border-dark-500/30 px-3 py-2 text-sm font-medium text-dark200_light900 hover:bg-dark-500/5">
        Sign up
      </Link>
    </div>
  </div>
);

export default LoginToAnswer;
