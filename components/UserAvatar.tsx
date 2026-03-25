"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "./ui/avatar";

interface UserAvatarProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
}

const UserAvatar = ({
  id,
  name,
  imageUrl,
  className = "h-9 w-9",
  fallbackClassName,
}: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const initials = name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href={ROUTES.PROFILE(id)}>
      <Avatar className={cn("relative", className)}>
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={name}
            className="object-cover"
            fill
            priority
            quality={100}
            sizes="140px"
            onError={handleImageError}
          />
        ) : (
          <AvatarFallback
            className={cn(
              "primary-gradient font-space-grotesk font-bold tracking-wider text-white",
              fallbackClassName,
            )}
          >
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
    </Link>
  );
};

export default UserAvatar;
