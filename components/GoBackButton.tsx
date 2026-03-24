"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function GoBackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center justify-center gap-2 rounded-lg border-2 border-light-700 bg-transparent px-6 py-3 font-semibold text-dark-100 transition-colors hover:bg-light-800 dark:border-dark-400 dark:text-light-900 dark:hover:bg-dark-400"
    >
      <ArrowLeft className="size-5" />
      Go Back
    </button>
  );
}
