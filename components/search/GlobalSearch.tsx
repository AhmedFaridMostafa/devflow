"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Command, CommandInput } from "../ui/command";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import GlobalSearchList from "./GlobalSearchList";
import GlobalFilter from "../filter/GlobalFilter";

const GlobalSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("global");
  const type = searchParams.get("type");
  const [search, setSearch] = useState(query || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "global",
          value: search,
        });
        router.push(newUrl, { scroll: false });
      } else {
        if (query) {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["global", "type"],
          });
          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, pathname, router, searchParams, query, type]);

  return (
    <div className="relative w-full max-w-150 min-w-100 max-lg:hidden">
      <Command className="global-search" shouldFilter={false}>
        <CommandInput
          placeholder="Search about anything..."
          value={search}
          onValueChange={setSearch}
        />
        <GlobalSearchList global={query} type={type}>
          <GlobalFilter type={type} urlParams={searchParams.toString()} />
        </GlobalSearchList>
      </Command>
    </div>
  );
};

export default GlobalSearch;
