interface Tag {
  _id: string;
  name: string;
  questions: number;
}

interface Author {
  _id: string;
  name: string;
  image?: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: Tag[];
  author: Author;
  upvotes: number;
  downvotes: number;
  answers: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

type SuccessResponse<T = null> = {
  success: true;
  data: T;
  status?: number;
};

type ErrorResponse = {
  success: false;
  status: number;
  error: {
    message: string;
    details?: Record<string, string[]>;
  };
};

type ActionResponse<T = null> = SuccessResponse<T> | ErrorResponse;

type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
  sort?: string;
}
interface Answer {
  _id: string;
  author: Author;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  question: string;
}

interface Collection {
  _id: string;
  author: string | Author;
  question: Question;
}

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
  createdAt: string;
  updatedAt: string;
}

type HotQuestion = Pick<Question, "_id" | "title">;

interface Badges {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
}
