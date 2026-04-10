"use client";

import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { useEffect, useState, Fragment } from "react";
import type { Serialize } from "@/lib/utils";
import { globalSearch } from "@/lib/actions/general.action";
import Link from "next/link";
import Image from "next/image";
import { renderLink } from "@/constants/routes";

interface GlobalSearchListProps {
  children: React.ReactNode;
  global: string | null;
  type: string | null;
}

const GlobalSearchList = ({
  children,
  global,
  type,
}: GlobalSearchListProps) => {
  const [result, setResult] = useState<Serialize<GlobalSearchResult>>({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!global) {
      setResult({});
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      setResult({});
      setLoading(true);
      try {
        const res = await globalSearch({ query: global, type });
        if (!res.success) return;
        setResult(res.data);
      } catch {
        setResult({});
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [global, type]);

  if (!global) return null;

  if (isLoading) {
    return (
      <CommandList>
        <CommandEmpty>Loading...</CommandEmpty>
      </CommandList>
    );
  }
  const entries = Object.entries(result);
  return (
    <CommandList>
      {children}
      <CommandEmpty>No results found.</CommandEmpty>
      {entries.map(([key, value], index) => (
        <Fragment key={key}>
          <CommandGroup heading={key} className="uppercase">
            {value.map((item) => (
              <CommandItem key={item._id} value={item.title}>
                <Link
                  href={renderLink(item.type, item._id)}
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-2.5"
                  prefetch={false}
                >
                  <Image
                    src="/icons/tag.svg"
                    alt={item.type}
                    width={18}
                    height={18}
                    className="invert-colors mt-1 object-contain"
                  />

                  <p className="body-medium text-dark200_light800 line-clamp-1 capitalize">
                    {item.title}
                  </p>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          {index !== entries.length - 1 && <CommandSeparator />}
        </Fragment>
      ))}
    </CommandList>
  );
};

export default GlobalSearchList;
