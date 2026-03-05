import Image from "next/image";
import { Button } from "../ui/button";
import { RefObject, useTransition } from "react";

import { toast } from "sonner";
import { api } from "@/lib/api";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { AnswerSchema } from "@/lib/validations";
import { Spinner } from "../ui/spinner";

interface AIAnswerButtonProps {
  editorRef: RefObject<MDXEditorMethods | null>;
  questionTitle: string;
  questionContent: string;
  form: UseFormReturn<z.infer<typeof AnswerSchema>>;
}

const AIAnswerButton = ({
  editorRef,
  questionTitle,
  questionContent,
  form,
}: AIAnswerButtonProps) => {
  const [isAISubmitting, startAITransition] = useTransition();

  const generateAIAnswer = () => {
    startAITransition(async () => {
      try {
        const userAnswer = form.getValues("content");
        const result = await api.ai.getAnswer(
          questionTitle,
          questionContent,
          userAnswer,
        );
        if (!result.success) {
          toast.error(result.error?.message);
          return;
        }

        const formattedAnswer = result.data
          .replace(/<br>/g, " ")
          .toString()
          .trim();

        if (editorRef.current) {
          editorRef.current.setMarkdown(formattedAnswer);
          form.setValue("content", formattedAnswer);
          form.trigger("content");
        }

        toast.success("AI generated answer has been generated");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "There was a problem with your request",
        );
      }
    });
  };

  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
      <h4 className="paragraph-semibold text-dark400_light800">
        Write your answer here
      </h4>
      <Button
        className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
        disabled={isAISubmitting}
        onClick={generateAIAnswer}>
        {isAISubmitting ? (
          <>
            <Spinner className="mr-2 size-4" />
            Generating...
          </>
        ) : (
          <>
            <Image
              src="/icons/stars.svg"
              alt="Generate AI Answer"
              width={12}
              height={12}
              className="object-contain"
            />
            Generate AI Answer
          </>
        )}
      </Button>
    </div>
  );
};

export default AIAnswerButton;
