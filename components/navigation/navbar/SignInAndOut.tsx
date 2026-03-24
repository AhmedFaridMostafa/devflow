import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SignInAndOut = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="flex flex-col gap-3">
      {userId ? (
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button
            type="submit"
            className="base-medium w-fit bg-transparent! px-4 py-3"
          >
            <LogOut className="size-5 text-black dark:text-white" />
            <span className="text-dark300_light900">Logout</span>
          </Button>
        </form>
      ) : (
        <>
          <Button
            className="small-medium btn-secondary min-h-10.25 w-full rounded-lg px-4 py-3 shadow-none"
            asChild
          >
            <Link href={ROUTES.SIGN_IN}>
              <Image
                src="/icons/account.svg"
                alt="Account"
                width={20}
                height={20}
                className="invert-colors lg:hidden"
              />
              <span className="primary-text-gradient">Log In</span>
            </Link>
          </Button>

          <Button
            className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-10.25 w-full rounded-lg border px-4 py-3 shadow-none"
            asChild
          >
            <Link href={ROUTES.SIGN_UP}>
              <Image
                src="/icons/sign-up.svg"
                alt="Sign Up"
                width={20}
                height={20}
                className="invert-colors lg:hidden"
              />
              <span>Sign Up</span>
            </Link>
          </Button>
        </>
      )}
    </div>
  );
};

export default SignInAndOut;
