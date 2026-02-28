import { getQuestion } from "@/lib/actions/question.action";
import { notFound } from "next/navigation";


const QuestionDetails = async ({ params }: RouteParams) => {
    const { id } = await params;
    const result = await getQuestion({ questionId: id });
    if (!result.success) return notFound();
    const question = result.data;

    return <div>Question Page: {question._id}</div>;
};

export default QuestionDetails;