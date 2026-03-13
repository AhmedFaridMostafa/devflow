"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "@/components/ui/select";
import { formUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";

interface Filter {
  name: string;
  value: string;
}

interface CommonFilterProps {
  filters: Filter[];
  containerClassName?: string;
  selectClassName?: string;
}

const CommonFilter = ({
  filters,
  containerClassName,
  selectClassName,
}: CommonFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsFilter = searchParams.get("filter") ?? undefined;

  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value,
    });
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <Select onValueChange={handleUpdateParams} value={paramsFilter}>
        <SelectTrigger
          className={cn(
            "body-regular no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5 w-full",
            selectClassName,
          )}
          aria-label="Filter options"
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a filter" />
          </div>
        </SelectTrigger>

        <SelectContent className="background-light850_dark100">
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilter;
