import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";
import { GoBackButton } from "@/components/GoBackButton";

export default function NotFound() {
  return (
    <div className="background-light850_dark100 flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Error illustration - theme-aware */}
        <div className="relative mb-8 h-48 w-64 sm:h-56 sm:w-72">
          <Image
            src="/images/light-error.png"
            alt="Page not found"
            fill
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/images/dark-error.png"
            alt="Page not found"
            fill
            className="hidden object-contain dark:block"
            priority
          />
        </div>

        {/* 404 badge */}
        <span className="primary-gradient mb-4 rounded-full px-4 py-1 text-sm font-semibold text-white shadow-lg">
          404
        </span>

        <h1 className="h1-bold mb-3 text-dark-100 dark:text-light-900">
          Page not found
        </h1>
        <p className="paragraph-regular mb-8 text-dark-500 dark:text-light-500">
          Oops! The page you&apos;re looking for doesn&apos;t exist or may have
          been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="primary-gradient flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
          >
            <Home className="size-5" />
            Back to Home
          </Link>
          <GoBackButton />
        </div>

        <p className="paragraph-regular mt-8 text-light-400 dark:text-light-500">
          Or explore{" "}
          <Link
            href="/"
            className="font-semibold text-dark-100 underline-offset-4 hover:underline dark:text-light-900"
          >
            Dev<span className="text-primary-500">Flow</span>
          </Link>{" "}
          to find answers to your questions.
        </p>
      </div>
    </div>
  );
}
