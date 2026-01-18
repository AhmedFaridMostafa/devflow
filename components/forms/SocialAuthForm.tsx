"use client";

import Image from "next/image";

import { signIn } from "next-auth/react";
import ROUTES from "@/constants/routes";

import { Button } from "../ui/button";
import { SOCIAL_AUTH_PROVIDERS } from "@/constants";
import { AuthProvider } from "@/types/auth";
import { toast } from "sonner";

const SocialAuthForm = () => {
  const handleSignIn = async (provider: AuthProvider) => {
    try {
      await signIn(provider, {
        callbackUrl: ROUTES.HOME,
      });
    } catch (error) {
      console.error(error);
      toast.error("Sign-in Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during sign-in",
      });
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      {SOCIAL_AUTH_PROVIDERS.map((provider) => (
        <Button
          key={provider.provider}
          className="background-dark400_light900 body-medium text-dark200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5"
          onClick={() => handleSignIn(provider.provider)}
        >
          <Image
            src={provider.imageSrc}
            alt={provider.imageAlt}
            width={20}
            height={20}
            className="invert-colors mr-2.5 object-contain"
          />
          <span>{provider.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default SocialAuthForm;
