import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/routes";
import { redirect } from "next/navigation";

const AskAQuestion = async () => {

    const season = await auth();
    if (!season) return redirect(ROUTES.SIGN_IN);

    return (
        <>
            <h1 className="h1-bold text-dark100_light900">Ask a question</h1>

            <div className="mt-9">
                <QuestionForm mode={{ type: "create" }} />
            </div>
        </>
    );
};

export default AskAQuestion;