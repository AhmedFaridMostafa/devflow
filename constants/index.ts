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

export const SIDEBAR_LINKS = [
  {
    imgURL: "/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/icons/users.svg",
    route: "/community",
    label: "Community",
  },
  {
    imgURL: "/icons/star.svg",
    route: "/collection",
    label: "Collections",
  },
  {
    imgURL: "/icons/suitcase.svg",
    route: "/jobs",
    label: "Find Jobs",
  },
  {
    imgURL: "/icons/tag.svg",
    route: "/tags",
    label: "Tags",
  },
  {
    imgURL: "/icons/user.svg",
    route: "/profile",
    label: "Profile",
  },
  {
    imgURL: "/icons/question.svg",
    route: "/ask-question",
    label: "Ask a question",
  },
];
