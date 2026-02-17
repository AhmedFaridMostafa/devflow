type AuthProvider = "github" | "google";

type SocialAuthProvider = {
  provider: AuthProvider;
  label: string;
  imageSrc: string;
  imageAlt: string;
};
