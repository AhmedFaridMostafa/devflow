import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/routes";
import { getQuestion } from "@/lib/actions/question.action";

const EditQuestion = async ({ params }: RouteParams) => {
    const { id } = await params;
    if (!id) return notFound();

    const session = await auth();
    if (!session || !session?.user) return redirect("/sign-in");

    const result = await getQuestion({ questionId: id });
    if (!result.success) return notFound();
    const question = result.data;
    if (question.author.toString() !== session.user.id) redirect(ROUTES.QUESTION(id));

    return (
        <main>
            <QuestionForm mode={{ type: "edit", question }} />
        </main>
    );
};

export default EditQuestion;