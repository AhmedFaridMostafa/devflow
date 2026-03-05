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

const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const [season, questionResult] = await Promise.all([
    auth(),
    getQuestion({ questionId: id }),
  ]);
  if (!questionResult.success) return redirect("/404");

  after(async () => {
    await incrementViews({ questionId: id });
  });

  const { _id, title, author, createdAt, answers, views, tags, content } =
    questionResult.data;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            {typeof author !== "string" && (
              <>
                <UserAvatar
                  id={author._id}
                  name={author.name}
                  className="size-[22px]"
                  fallbackClassName="text-[10px]"
                />
                <Link href={ROUTES.PROFILE(author._id)}>
                  <p className="paragraph-semibold text-dark300_light700">
                    {author.name}
                  </p>
                </Link>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <p>Votes</p>
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
        {tags.map(
          (tag) =>
            typeof tag !== "string" && (
              <TagCard key={tag._id} _id={tag._id} name={tag.name} compact />
            ),
        )}
      </div>

      <section className="my-5">
        {season?.user?.id ? (
          <AnswerForm
            userId={season.user.id}
            questionId={_id}
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
