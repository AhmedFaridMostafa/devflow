"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const filters = [
    { name: "React", value: "react" },
    { name: "JavaScript", value: "javascript" },

    // { name: "Newest", value: "newest" },
    // { name: "Popular", value: "popular" },
    // { name: "Unanswered", value: "unanswered" },
    // { name: "Recommeded", value: "recommended" },
];

const HomeFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const filterParams = searchParams.get("filter");

    const handleTypeClick = (filter: string) => {
        let newUrl = "";
        if (filter === filterParams) {
            newUrl = removeKeysFromUrlQuery({
                params: searchParams.toString(),
                keysToRemove: ["filter"],
            });
        } else {
            newUrl = formUrlQuery({
                params: searchParams.toString(),
                key: "filter",
                value: filter.toLowerCase(),
            });
        }
        router.push(newUrl, { scroll: false });
    };

    return (
        <div className="mt-10 hidden flex-wrap gap-3 sm:flex">
            {filters.map((filter) => (
                <Button
                    key={filter.name}
                    className={cn(
                        `body-medium rounded-lg px-6 py-3 capitalize shadow-none cursor-pointer
                        "bg-light-800 text-light-500 hover:bg-primary-100 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-400  hover:text-primary-500!          
                        `,
                        {
                            "bg-primary-100 text-primary-500  dark:bg-dark-400 dark:text-primary-500 ": filterParams === filter.value
                        }
                    )}
                    onClick={() => handleTypeClick(filter.value)}
                >
                    {filter.name}
                </Button>
            ))
            }
        </div >
    );
};

export default HomeFilter;