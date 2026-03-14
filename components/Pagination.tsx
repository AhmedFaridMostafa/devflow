"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { formUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

interface PaginationProps {
  page: number | string;
  isNext: boolean;
  containerClassName?: string;
}

const Pagination = ({
  page = 1,
  isNext,
  containerClassName,
}: PaginationProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleNavigation = (type: "prev" | "next") => {
    const nextPageNumber =
      type === "prev" ? Number(page) - 1 : Number(page) + 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });

    router.push(newUrl);
  };

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2 mt-5",
        containerClassName,
      )}
    >
      {/* Previous Page Button */}
      {Number(page) > 1 && (
        <Button
          onClick={() => handleNavigation("prev")}
          className="light-border-2 btn flex min-h-9 items-center justify-center gap-2 border body-medium text-dark200_light800"
        >
          Prev
        </Button>
      )}

      <span className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2 body-semibold text-light-900">
        {page}
      </span>

      {/* Next Page Button */}
      {isNext && (
        <Button
          onClick={() => handleNavigation("next")}
          className="light-border-2 btn flex min-h-9 items-center justify-center gap-2 border body-medium text-dark200_light800"
        >
          Next
        </Button>
      )}
    </div>
  );
};

export default Pagination;
