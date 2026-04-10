"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { Button } from "../ui/button";

const filters = [
  { name: "Newest", value: "newest" },
  { name: "Popular", value: "popular" },
  { name: "Unanswered", value: "unanswered" },
  { name: "Recommended", value: "recommended" },
];

const HomeFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParams = searchParams.get("filter");

  const handleTypeClick = (filter: string) => {
    const newUrl =
      filter === filterParams
        ? removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["filter"],
          })
        : formUrlQuery({
            params: searchParams.toString(),
            key: "filter",
            value: filter.toLowerCase(),
          });
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {filters.map((filter) => (
        <Button
          key={filter.name}
          type="button"
          variant={filter.value === filterParams ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleTypeClick(filter.value)}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilter;
