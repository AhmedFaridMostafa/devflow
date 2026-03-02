import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions/tag.action";


const Page = async ({ params, searchParams }: RouteParams) => {
    const { id } = await params;
    const { page, pageSize, query } = await searchParams;

    const result = await getTagQuestions({
        tagId: id,
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        query,
    });


    return (
        <>
            <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="h1-bold text-dark100_light900 uppercase">{result.success && result.data.tag.name}</h1>
            </section>

            <section className="mt-11">
                <LocalSearch
                    route={ROUTES.TAG(id)}
                    imgSrc="/icons/search.svg"
                    placeholder="Search questions..."
                    otherClasses="flex-1"
                />
            </section>

            <DataRenderer
                response={result}
                selector={(data) => data.questions}
                empty={EMPTY_QUESTION}
                render={(questions) => (
                    <div className="mt-10 flex w-full flex-col gap-6">
                        {questions.map((question) => (
                            <QuestionCard key={question._id} question={question} />
                        ))}
                    </div>
                )}
            />
        </>
    );
};

export default Page;