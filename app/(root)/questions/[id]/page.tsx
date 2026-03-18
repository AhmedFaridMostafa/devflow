import TagCard from "@/components/cards/TagCard";
import { Preview } from "@/components/editor/Preview";
import Metric from "@/components/Metric";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routes";
import { getQuestion, incrementViews } from "@/lib/actions/question.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { after } from "next/server";
import AnswerForm from "@/components/forms/AnswerForm";
import { auth } from "@/auth";
import LoginToAnswer from "@/components/LoginToAnswer";
import { getAnswers } from "@/lib/actions/answer.action";
import AllAnswers from "@/components/answers/AllAnswers";
import Votes from "@/components/votes/Votes";
import { hasVoted } from "@/lib/actions/vote.action";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import SaveQuestion from "@/components/questions/SaveQuestion";
import { hasSavedQuestion } from "@/lib/actions/collection.action";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;

  const questionResult = await getQuestion({ questionId: id });

  if (!questionResult.success) {
    return {
      title: "Question not found",
      description: "This question does not exist.",
    };
  }
  const question = questionResult.data;
  return {
    title: question.title,
    description: question.content.slice(0, 100),
    twitter: {
      card: "summary_large_image",
      title: question.title,
      description: question.content.slice(0, 100),
    },
  };
}

const QuestionDetails = async ({ params, searchParams }: RouteParams) => {
  const [{ id }, { page, pageSize, filter }] = await Promise.all([
    params,
    searchParams,
  ]);

  const [season, questionResult] = await Promise.all([
    auth(),
    getQuestion({ questionId: id }),
  ]);

  if (!questionResult.success) return redirect("/404");

  after(async () => {
    await incrementViews({ questionId: id });
  });

  const answersResult = await getAnswers({
    questionId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter,
  });

  const {
    _id: questionId,
    title,
    author,
    createdAt,
    answers,
    views,
    tags,
    content,
    downvotes,
    upvotes,
  } = questionResult.data;

  const hasVotedPromise = hasVoted({
    targetId: questionId,
    targetType: "question",
  });

  const hasSavedQuestionPromise = hasSavedQuestion({
    questionId: questionId,
  });

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              imageUrl={author.image}
              className="size-5.5"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>

          <div className="flex justify-end gap-4">
            <Suspense fallback={<Spinner />}>
              <Votes
                targetType="question"
                upvotes={upvotes}
                downvotes={downvotes}
                targetId={questionId}
                hasVotedPromise={hasVotedPromise}
                userId={season?.user?.id || ""}
              />
            </Suspense>
            <Suspense fallback={<Spinner />}>
              <SaveQuestion
                questionId={questionId}
                userId={season?.user?.id || ""}
                hasSavedQuestionPromise={hasSavedQuestionPromise}
              />
            </Suspense>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagCard key={tag._id} _id={tag._id} name={tag.name} compact />
        ))}
      </div>
      <section className="my-5">
        <AllAnswers page={Number(page) || 1} {...answersResult} />
      </section>
      <section className="my-5">
        {season?.user?.id ? (
          <AnswerForm
            questionId={questionId}
            questionTitle={title}
            questionContent={content}
          />
        ) : (
          <LoginToAnswer />
        )}
      </section>
    </>
  );
};

export default QuestionDetails;
