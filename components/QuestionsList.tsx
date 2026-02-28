import QuestionCard from "@/components/cards/QuestionCard";

interface QuestionsListProps {
    questions?: Question[];
    success: boolean;
    error?: { message?: string };
}

const QuestionsList = ({
    questions = [],
    success,
    error,
}: QuestionsListProps) => {
    if (!success) {
        return (
            <div className="mt-10 flex w-full items-center justify-center">
                <p className="text-dark400_light700">
                    {error?.message || "Failed to fetch questions"}
                </p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="mt-10 flex w-full items-center justify-center">
                <p className="text-dark400_light700">No questions found</p>
            </div>
        );
    }

    return (
        <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
                <QuestionCard key={question._id} question={question} />
            ))}
        </div>
    );
};

export default QuestionsList;