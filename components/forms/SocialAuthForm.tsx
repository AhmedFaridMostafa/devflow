"use client";

import Image from "next/image";

import { signIn } from "next-auth/react";
import ROUTES from "@/constants/routes";

import { Button } from "../ui/button";
import { SOCIAL_AUTH_PROVIDERS } from "@/constants";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

const SocialAuthForm = () => {
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(
    null,
  );

  const handleSignIn = async (provider: AuthProvider) => {
    setPendingProvider(provider);
    try {
      await signIn(provider, {
        redirectTo: ROUTES.HOME,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error("Sign-in Failed", { description: error.message });
      } else {
        throw error;
      }
    } finally {
      setPendingProvider(null);
    }
  };

  const isLoading = pendingProvider !== null;

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      {SOCIAL_AUTH_PROVIDERS.map((provider) => {
        const isPending = pendingProvider === provider.provider;
        return (
          <Button
            key={provider.provider}
            disabled={isLoading}
            className="cursor-pointer background-dark400_light900 body-medium text-dark200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5"
            onClick={() => handleSignIn(provider.provider)}
          >
            {isPending ? (
              <Spinner className="mr-2.5 size-5" />
            ) : (
              <Image
                src={provider.imageSrc}
                alt={provider.imageAlt}
                width={20}
                height={20}
                className="invert-colors mr-2.5 object-contain"
              />
            )}
            <span>{isPending ? `Signing in...` : provider.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default SocialAuthForm;
