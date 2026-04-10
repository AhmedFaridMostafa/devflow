"use client";

import { useRouter } from "next/navigation";

import { GlobalSearchFilters } from "@/constants/filters";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { Spinner } from "../ui/spinner";

interface GlobalFilterProps {
  type: string | null;
  urlParams: string;
}

const GlobalFilter = ({ type, urlParams }: GlobalFilterProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleTypeClick = (item: string) => {
    startTransition(() => {
      const newUrl =
        type === item
          ? removeKeysFromUrlQuery({
              params: urlParams,
              keysToRemove: ["type"],
            })
          : formUrlQuery({
              params: urlParams,
              key: "type",
              value: item.toLowerCase(),
            });
      router.push(newUrl, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-2 px-2 flex-wrap">
      <p className="text-dark400_light900 body-medium">Type:</p>
      <div className="flex gap-2 flex-wrap items-center">
        {GlobalSearchFilters.map((item) => (
          <Button
            type="button"
            key={item.value}
            variant={type === item.value ? "default" : "outline"}
            className="rounded-2xl cursor-pointer"
            onClick={() => handleTypeClick(item.value)}
            disabled={isPending}
          >
            {item.name}
            {isPending && item.value === type && <Spinner />}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default GlobalFilter;
