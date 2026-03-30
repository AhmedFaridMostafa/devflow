import { z } from "zod";
import { escapeRegex } from "./utils";
import { InteractionActionEnums } from "@/constants/interaction";

// ─── Reusable primitives ─────────────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(6, { error: "Password must be at least 6 characters long." })
  .max(100, { error: "Password cannot exceed 100 characters." })
  .regex(/[A-Z]/, {
    error: "Password must contain at least one uppercase letter.",
  })
  .regex(/[a-z]/, {
    error: "Password must contain at least one lowercase letter.",
  })
  .regex(/[0-9]/, { error: "Password must contain at least one number." })
  .regex(/[^a-zA-Z0-9]/, {
    error: "Password must contain at least one special character.",
  });

// Centralises the skip transform so it never gets copy-pasted again
const withSkip = <T extends { page: number; pageSize: number }>(data: T) => ({
  ...data,
  skip: (data.page - 1) * data.pageSize,
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const SignInSchema = z.object({
  email: z
    .email({ error: "Please provide a valid email address." })
    .trim()
    .min(1, { error: "Email is required." }),
  password: passwordSchema,
});

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { error: "Username must be at least 3 characters long." })
    .max(30, { error: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      error: "Username can only contain letters, numbers, and underscores.",
    }),
  name: z
    .string()
    .min(1, { error: "Name is required." })
    .max(50, { error: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      error: "Name can only contain letters and spaces.",
    }),
  email: z
    .email({ error: "Please provide a valid email address." })
    .trim()
    .min(1, { error: "Email is required." }),
  password: passwordSchema,
});

export const SignInWithOAuthSchema = z.object({
  provider: z.enum(["google", "github"]),
  providerAccountId: z
    .string()
    .min(1, { error: "Provider Account ID is required." }),
  user: z.object({
    name: z.string().min(1, { error: "Name is required." }),
    username: z
      .string()
      .min(3, { error: "Username must be at least 3 characters long." }),
    email: z.email({ error: "Please provide a valid email address." }),
    image: z.url({ error: "Please provide a valid URL." }).optional(),
  }),
});

// ─── User ─────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  name: z.string().min(1, { error: "Name is required." }),
  username: z
    .string()
    .min(3, { error: "Username must be at least 3 characters long." }),
  email: z.email({ error: "Please provide a valid email address." }),
  bio: z.string().optional(),
  image: z.url({ error: "Please provide a valid URL." }).optional(),
  location: z.string().optional(),
  portfolio: z.url({ error: "Please provide a valid URL." }).optional(),
  reputation: z.number().optional(),
});

export const AccountSchema = z.object({
  userId: z.string().min(1, { error: "User ID is required." }),
  name: z.string().min(1, { error: "Name is required." }),
  image: z.url({ error: "Please provide a valid URL." }).optional(),
  password: passwordSchema.optional(),
  provider: z.string().min(1, { error: "Provider is required." }),
  providerAccountId: z
    .string()
    .min(1, { error: "Provider Account ID is required." }),
});

export const GetUserSchema = z.object({
  userId: z.string().min(1, { error: "User ID is required." }),
});

export const UpdateProfileSchema = z.object({
  userId: z.string().min(1, { error: "User ID is required." }),
  name: z
    .string()
    .min(3, {
      error: "Name must be at least 3 characters.",
    })
    .max(130, { error: "Name mustn't be longer then 130 characters." }),
  username: z
    .string()
    .min(3, { error: "username mustn't be longer then 100 characters." })
    .max(100, { error: "username mustn't be longer then 100 characters." }),
  bio: z
    .string()
    .min(3, { error: "Bio must be at least 3 characters." })
    .max(1000, { error: "Bio mustn't be longer then 1000 characters." })
    .optional(),
  location: z
    .string()
    .min(3, { error: "Please provide proper location" })
    .max(100, { error: "Location mustn't be longer then 100 characters." })
    .optional(),
  portfolio: z.url({ error: "Please provide valid URL" }).optional(),
});
// ─── Questions ────────────────────────────────────────────────────────────────

export const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "Tag must have at least 1 character." })
  .max(15, { error: "Tag must not exceed 15 characters." });

export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(5, { error: "Title must be at least 5 characters." })
    .max(130, { error: "Title mustn't be longer than 130 characters." }),
  content: z.string().min(100, { error: "Minimum of 100 characters." }),
  tags: z
    .array(tagSchema)
    .min(1, { error: "Add at least one tag." })
    .max(3, { error: "Maximum of 3 tags." })
    .refine((tags) => new Set(tags).size === tags.length, {
      error: "Tags must be unique.",
    }),
});

export type AskQuestionFormData = z.infer<typeof AskQuestionSchema>;

export const EditQuestionSchema = AskQuestionSchema.extend({
  questionId: z.string().min(1, { error: "Question ID is required." }),
});

export const GetQuestionSchema = z.object({
  questionId: z.string().min(1, { error: "Question ID is required." }),
});

export const IncrementViewsSchema = z.object({
  questionId: z.string().min(1, { error: "Question ID is required." }),
});

export const DeleteQuestionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const BasePaginatedSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  query: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? escapeRegex(val) : val)),
  filter: z.string().trim().optional(),
  sort: z.string().trim().optional(),
});

export const PaginatedSearchParamsSchema =
  BasePaginatedSearchParamsSchema.transform(withSkip);

export const GetTagQuestionsSchema = BasePaginatedSearchParamsSchema.extend({
  tagId: z.string().min(1, { error: "Tag ID is required." }),
}).transform(withSkip);

// ─── Answers ──────────────────────────────────────────────────────────────────

export const AnswerSchema = z.object({
  content: z.string().min(100, { error: "Minimum of 100 characters." }),
});

export const AnswerServerSchema = AnswerSchema.extend({
  questionId: z.string().min(1, { error: "Question ID is required." }),
});

export const GetAnswersSchema = BasePaginatedSearchParamsSchema.extend({
  questionId: z.string().min(1, { error: "Question ID is required." }),
}).transform(withSkip);

export const DeleteAnswerSchema = z.object({
  answerId: z.string().min(1, "Answer ID is required"),
});

// ─── AI ───────────────────────────────────────────────────────────────────────

export const AIAnswerSchema = z.object({
  question: z
    .string()
    .min(5, { error: "Question title must be at least 5 characters." })
    .max(130, {
      error: "Question title mustn't be longer than 130 characters.",
    }),
  content: z.string().min(100, {
    error: "Question description must have a minimum of 100 characters.",
  }),
  userAnswer: z.string().optional(),
});

// ─── Votes ────────────────────────────────────────────────────────────────────

export const CreateVoteSchema = z.object({
  targetId: z.string().min(1, { error: "Target ID is required." }),
  targetType: z.enum(["question", "answer"], { error: "Invalid target type." }),
  voteType: z.enum(["upvote", "downvote"], { error: "Invalid vote type." }),
});

export const UpdateVoteCountSchema = CreateVoteSchema.extend({
  change: z.number().int().min(-1).max(1),
});

export const HasVotedSchema = CreateVoteSchema.pick({
  targetId: true,
  targetType: true,
});

// ─── Collections ──────────────────────────────────────────────────────────────

export const CollectionBaseSchema = z.object({
  questionId: z.string().min(1, { error: "Question ID is required." }),
});

// ─── User content (paginated) ────────────────────────────────────────────────

export const GetUserQuestionsSchema = BasePaginatedSearchParamsSchema.extend({
  userId: z.string().min(1, { error: "User ID is required." }),
}).transform(withSkip);

// Structurally identical to GetUserQuestionsSchema — aliased for semantic clarity
export const GetUsersAnswersSchema = GetUserQuestionsSchema;

export const GetUserTagsSchema = z.object({
  userId: z.string().min(1, { error: "User ID is required." }),
});

// ─── Interaction ────────────────────────────────────────────────

export const CreateInteractionSchema = z.object({
  action: z.enum(InteractionActionEnums, { error: "Invalid action type." }),
  actionTarget: z.enum(["question", "answer"], {
    error: "Invalid target type.",
  }),
  actionId: z.string().min(1, { error: "Action ID is required." }),
  authorId: z.string().min(1, { error: "Author ID is required." }),
});
