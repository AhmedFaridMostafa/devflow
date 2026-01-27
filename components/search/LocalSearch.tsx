"use client";

import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

import { Input } from "../ui/input";

interface LocalSearchProps {
    route: string;
    imgSrc: string;
    placeholder: string;
    otherClasses?: string;
    iconPosition?: "left" | "right";
    debounceMs?: number;
}

const LocalSearch = ({
    route,
    imgSrc,
    placeholder,
    otherClasses,
    iconPosition = "left",
    debounceMs = 300,
}: LocalSearchProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";

    const [searchQuery, setSearchQuery] = useState(query);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const currentQuery = searchParams.get("query") || "";
            if (searchQuery !== currentQuery) {
                if (searchQuery) {
                    const newUrl = formUrlQuery({
                        params: searchParams.toString(),
                        key: "query",
                        value: searchQuery,
                    });
                    router.push(newUrl, { scroll: false });
                } else {
                    if (pathname === route) {
                        const newUrl = removeKeysFromUrlQuery({
                            params: searchParams.toString(),
                            keysToRemove: ["query"],
                        });
                        router.push(newUrl, { scroll: false });
                    }
                }
            }
        }, debounceMs);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, router, route, searchParams, pathname, debounceMs]);

    return (
        <div
            className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
            role="search"
        >
            {iconPosition === "left" && (
                <Image
                    src={imgSrc}
                    width={24}
                    height={24}
                    alt="Search"
                    className="cursor-pointer"
                    aria-hidden="true"
                />
            )}

            <Input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
                className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
            />

            {iconPosition === "right" && (
                <Image
                    src={imgSrc}
                    width={15}
                    height={15}
                    alt="Search"
                    className="cursor-pointer"
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default LocalSearch;