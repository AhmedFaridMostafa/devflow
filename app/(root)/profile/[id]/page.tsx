import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import AnswerCard from "@/components/cards/AnswerCard";
import QuestionCard from "@/components/cards/QuestionCard";
import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileLink from "@/components/user/ProfileLink";
import Stats from "@/components/user/Stats";
import UserAvatar from "@/components/UserAvatar";
import { EMPTY_ANSWERS, EMPTY_QUESTION, EMPTY_TAGS } from "@/constants/states";
import {
  getUser,
  getUserAnswers,
  getUserQuestions,
  getUserStats,
  getUserTopTags,
} from "@/lib/actions/user.action";
import { formatMonthYear } from "@/lib/utils";

const ProfilePage = async ({ params, searchParams }: RouteParams) => {
  const [{ id }, { page, pageSize }] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!id) notFound();

  const [loggedInUser, userResult] = await Promise.all([
    auth(),
    getUser({ userId: id }),
  ]);

  if (!userResult.success)
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="h1-bold text-dark100_light900">User not found</h1>
        <p className="paragraph-regular text-dark200_light800 max-w-md">
          {userResult.error?.message}
        </p>
      </div>
    );

  const { user } = userResult.data;

  const pageNumber = Number(page) || 1;
  const pageSizeNumber = Number(pageSize) || 10;

  const [
    statsResult,
    userQuestionsResult,
    userAnswersResult,
    userTopTagsResult,
  ] = await Promise.all([
    getUserStats({ userId: id }),
    getUserQuestions({
      userId: id,
      page: pageNumber,
      pageSize: pageSizeNumber,
    }),
    getUserAnswers({ userId: id, page: pageNumber, pageSize: pageSizeNumber }),
    getUserTopTags({ userId: id }),
  ]);

  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <UserAvatar
            id={user._id}
            name={user.name}
            imageUrl={user.image}
            className="size-35 rounded-full object-cover"
            fallbackClassName="text-6xl font-bolder"
          />

          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
            <p className="paragraph-regular text-dark200_light800">
              @{user.username}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {user.portfolio && (
                <ProfileLink
                  imgUrl="/icons/link.svg"
                  href={user.portfolio}
                  title="Portfolio"
                />
              )}
              {user.location && (
                <ProfileLink
                  imgUrl="/icons/location.svg"
                  title={user.location}
                />
              )}
              <ProfileLink
                imgUrl="/icons/calendar.svg"
                title={formatMonthYear(user.createdAt)}
              />
            </div>

            {user.bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {loggedInUser?.user?.id === id && (
            <Button
              className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3 cursor-pointer"
              asChild
            >
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          )}
        </div>
      </section>

      <Stats
        totalQuestions={
          statsResult.success ? statsResult.data.totalQuestions : 0
        }
        totalAnswers={statsResult.success ? statsResult.data.totalAnswers : 0}
        badges={
          statsResult.success
            ? statsResult.data.badges
            : { GOLD: 0, SILVER: 0, BRONZE: 0 }
        }
        reputationPoints={user.reputation ?? 0}
      />

      <section className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-2">
          <TabsList className="background-light800_dark400 min-h-10.5 p-1">
            <TabsTrigger value="top-posts" className="tab">
              Top Posts
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab">
              Answers
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="top-posts"
            className="mt-5 flex w-full flex-col gap-6"
          >
            <DataRenderer
              response={userQuestionsResult}
              selector={(data) => data.questions}
              empty={EMPTY_QUESTION}
              render={(questions) => (
                <div className="flex w-full flex-col gap-6">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      showActionBtns={
                        loggedInUser?.user?.id === question.author._id
                      }
                    />
                  ))}
                </div>
              )}
            />
            <Pagination
              page={page}
              isNext={
                userQuestionsResult.success
                  ? userQuestionsResult.data.isNext
                  : false
              }
            />
          </TabsContent>

          <TabsContent value="answers" className="flex w-full flex-col gap-6">
            <DataRenderer
              response={userAnswersResult}
              selector={(data) => data.answers}
              empty={EMPTY_ANSWERS}
              render={(answers) => (
                <div className="flex w-full flex-col gap-10">
                  {answers.map((answer) => (
                    <AnswerCard
                      key={answer._id}
                      {...answer}
                      content={answer.content.slice(0, 270)}
                      containerClassName="card-wrapper rounded-[10px] px-7 py-9 sm:px-11"
                      showReadMore
                      showActionBtns={
                        loggedInUser?.user?.id === answer.author._id
                      }
                    />
                  ))}
                </div>
              )}
            />
            <Pagination
              page={page}
              isNext={
                userAnswersResult.success
                  ? userAnswersResult.data.isNext
                  : false
              }
            />
          </TabsContent>
        </Tabs>

        <div className="flex w-full min-w-62.5 flex-1 flex-col max-lg:hidden">
          <h3 className="h3-bold text-dark200_light900">Top Tags</h3>

          <div className="mt-7 flex flex-col gap-4">
            <DataRenderer
              response={userTopTagsResult}
              selector={(data) => data.tags}
              empty={EMPTY_TAGS}
              render={(tags) => (
                <div className="mt-3 flex w-full flex-col gap-4">
                  {tags.map((tag) => (
                    <TagCard
                      key={tag._id}
                      _id={tag._id}
                      name={tag.name}
                      questions={tag.count}
                      showCount
                      compact
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfilePage;
