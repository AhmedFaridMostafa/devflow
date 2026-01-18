import { SocialAuthProvider } from "@/types/auth";

export const SOCIAL_AUTH_PROVIDERS: SocialAuthProvider[] = [
  {
    provider: "github",
    label: "Log in with GitHub",
    imageSrc: "/icons/github.svg",
    imageAlt: "Github Logo",
  },
  {
    provider: "google",
    label: "Log in with Google",
    imageSrc: "/icons/google.svg",
    imageAlt: "Google Logo",
  },
];
