import { getQuestion } from "@/lib/actions/question.action";


const QuestionDetails = async ({ params }: RouteParams) => {
    const { id } = await params;
    const { success, data: question } = await getQuestion({ questionId: id });
    console.log(success)
    console.log(question)
    return <div>Question Page: {id}</div>;
};

export default QuestionDetails;