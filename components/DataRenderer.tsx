import { DEFAULT_EMPTY, DEFAULT_ERROR } from "@/constants/states";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

interface ButtonLink {
    text: string;
    href: string;
}

type DataRendererProps<T, D> = {
    response: ActionResponse<D>;
    selector?: (data: D) => T[];
    empty?: { title: string; message: string; button?: ButtonLink };
    render: (data: T[]) => React.ReactNode;
};

interface StateSkeletonProps {
    image: {
        light: string;
        dark: string;
        alt: string;
    };
    title: string;
    message: string;
    button?: ButtonLink;
}

const StateSkeleton = ({
    image,
    title,
    message,
    button,
}: StateSkeletonProps) => (
    <div className="mt-16 flex w-full flex-col items-center justify-center sm:mt-36">
        <Image
            src={image.dark}
            alt={image.alt}
            width={270}
            height={200}
            className="hidden object-contain dark:block"
        />
        <Image
            src={image.light}
            alt={image.alt}
            width={270}
            height={200}
            className="block object-contain dark:hidden"
        />


        <h2 className="h2-bold text-dark200_light900 mt-8">{title}</h2>
        <p className="body-regular text-dark500_light700 my-3.5 max-w-md text-center">
            {message}
        </p>
        {button && (
            <Link href={button.href}>
                <Button className="paragraph-medium mt-5 min-h-[46px] rounded-lg bg-primary-500 px-4 py-3 text-light-900 hover:bg-primary-500">
                    {button.text}
                </Button>
            </Link>
        )}
    </div>
);

const DataRenderer = <T, D>({
    response,
    selector,
    empty = DEFAULT_EMPTY,
    render,
}: DataRendererProps<T, D>) => {

    if (!response.success) {
        const { error } = response;
        return (
            <StateSkeleton
                image={{
                    light: "/images/light-error.png",
                    dark: "/images/dark-error.png",
                    alt: "Error state illustration",
                }}
                title={error?.message || DEFAULT_ERROR.title}
                message={
                    error?.details
                        ? JSON.stringify(error.details, null, 2)
                        : DEFAULT_ERROR.message
                }
                button={DEFAULT_ERROR.button}
            />
        );
    }
    const data = selector ? selector(response.data) : (response.data as T[]);

    if (!data || data.length === 0) {
        return (
            <StateSkeleton
                image={{ light: "/images/light-illustration.png", dark: "/images/dark-illustration.png", alt: "Empty" }}
                title={empty.title}
                message={empty.message}
                button={empty.button}
            />
        );
    }
    return <>{render(data)}</>;
};

export default DataRenderer;