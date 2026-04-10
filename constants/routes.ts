const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ASK_QUESTION: "/ask-question",
  COLLECTION: "/collection",
  COMMUNITY: "/community",
  TAGS: "/tags",
  JOBS: "/jobs",
  PROFILE: (id: string) => `/profile/${id}`,
  QUESTION: (id: string) => `/questions/${id}`,
  TAG: (id: string) => `/tags/${id}`,
  SIGN_IN_WITH_OAUTH: `signin-with-oauth`,
};

const ROUTE_MAP: Record<string, (id: string) => string> = {
  question: (id) => `/questions/${id}`,
  answer: (id) => `/questions/${id}`,
  user: (id) => `/profile/${id}`,
  tag: (id) => `/tags/${id}`,
};

export const renderLink = (type: string, id: string) =>
  ROUTE_MAP[type]?.(id) ?? "/";
export default ROUTES;
