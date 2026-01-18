export type AuthProvider = "github" | "google";

export type SocialAuthProvider = {
  provider: AuthProvider;
  label: string;
  imageSrc: string;
  imageAlt: string;
};
