"use client"; 

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { GoBackButton } from "@/components/GoBackButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="background-light850_dark100 flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Error illustration - theme-aware */}
        <div className="relative mb-8 h-48 w-64 sm:h-56 sm:w-72">
          <Image
            src="/images/light-error.png"
            alt="An error occurred"
            fill
            className="object-contain dark:hidden"
            sizes="288px"
            priority
          />
          <Image
            src="/images/dark-error.png"
            alt="An error occurred"
            fill
            className="hidden object-contain dark:block"
            sizes="288px"
            priority
          />
        </div>

        {/* 500 badge */}
        <span className="primary-gradient mb-4 rounded-full px-4 py-1 text-sm font-semibold text-white shadow-lg">
          500 Error
        </span>

        <h1 className="h1-bold mb-3 text-dark-100 dark:text-light-900">
          Oops! Something went wrong
        </h1>
        <p className="paragraph-regular mb-8 text-dark-500 dark:text-light-500">
          An unexpected error has occurred. Let&apos;s try to refresh the page or head back to safety.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={() => reset()}
            className="primary-gradient flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
          >
            <RefreshCcw className="size-5" />
            Try again
          </button>
          <GoBackButton />
        </div>

        <p className="paragraph-regular mt-8 text-light-400 dark:text-light-500">
          Or return to{" "}
          <Link
            href="/"
            className="font-semibold text-dark-100 underline-offset-4 hover:underline dark:text-light-900"
          >
            Dev<span className="text-primary-500">Flow</span>
          </Link>{" "}
          Home
        </p>
      </div>
    </div>
  );
}
