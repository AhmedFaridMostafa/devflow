"use client";

import { AnswerSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup } from "../ui/field";

import { Button } from "../ui/button";
import dynamic from "next/dynamic";

import { Spinner } from "../ui/spinner";

import { z } from "zod";
import { useRef } from "react";

import { MDXEditorMethods } from "@mdxeditor/editor";
import AIAnswerButton from "../AI/AIAnswerButton";
import { toast } from "sonner";
import { createAnswer } from "@/lib/actions/answer.action";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => <Spinner className="size-8" />,
});

interface AnswerFormProps {
  questionId: string;
  questionTitle: string;
  questionContent: string;
}

const AnswerForm = ({
  questionId,
  questionTitle,
  questionContent,
}: AnswerFormProps) => {
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const editorRef = useRef<MDXEditorMethods>(null);

  const isAnswering = form.formState.isSubmitting;

  const handleCreateAnswer = async (data: z.infer<typeof AnswerSchema>) => {
    const result = await createAnswer({
      questionId,
      content: data.content,
    });
    if (result.success) {
      toast.success("Your answer has been posted successfully");
      form.reset();
      if (editorRef?.current) editorRef.current.setMarkdown("");
    } else {
      toast.error(result.error?.message);
    }
  };

  return (
    <div>
      <AIAnswerButton
        editorRef={editorRef}
        questionTitle={questionTitle}
        questionContent={questionContent}
        form={form}
      />
      <form
        className="mt-6 flex w-full flex-col gap-10"
        // eslint-disable-next-line react-hooks/refs
        onSubmit={form.handleSubmit(handleCreateAnswer)}>
        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex w-full flex-col">
                <Editor
                  editorRef={editorRef}
                  value={field.value}
                  fieldChange={field.onChange}
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field orientation="horizontal" className="justify-end">
            <Button
              type="submit"
              className="primary-gradient w-fit text-light-900"
              disabled={isAnswering}>
              {isAnswering ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};

export default AnswerForm;
