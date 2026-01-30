"use client";

import { AskQuestionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRef } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import TagCard from "../cards/TagCard";
import { z } from "zod";
import { Spinner } from "../ui/spinner";


const Editor = dynamic(() => import("@/components/editor"), {
    ssr: false,
    loading: () => <Spinner className="size-8" />,
});

type AskQuestionFormData = z.infer<typeof AskQuestionSchema>;


const QuestionForm = () => {
    const form = useForm<AskQuestionFormData>({
        resolver: zodResolver(AskQuestionSchema),
        defaultValues: {
            title: "",
            content: "",
            tags: [],
        },
    });

    const editorRef = useRef<MDXEditorMethods>(null);

    const handleTagRemove = (tagToRemove: string) => {
        const currentTags = form.getValues("tags");
        const newTags = currentTags.filter((tag) => tag !== tagToRemove);
        form.setValue("tags", newTags, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        currentTags: string[]
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const tagInput = e.currentTarget.value.trim().toLowerCase();

            // Validate empty input
            if (!tagInput) {
                return;
            }

            // Check max tags limit
            if (currentTags.length >= 3) {
                form.setError("tags", {
                    type: "manual",
                    message: "Cannot add more than 3 tags.",
                });
                return;
            }

            // Check tag length (must match validation schema)
            if (tagInput.length > 30) {
                form.setError("tags", {
                    type: "manual",
                    message: "Tag cannot exceed 30 characters.",
                });
                return;
            }

            // Check for duplicates
            if (currentTags.includes(tagInput)) {
                form.setError("tags", {
                    type: "manual",
                    message: "Tag already exists.",
                });
                return;
            }

            // Add the tag
            form.setValue("tags", [...currentTags, tagInput], {
                shouldValidate: true,
                shouldDirty: true,
            });

            // Clear input
            e.currentTarget.value = "";

            // Clear any previous errors
            form.clearErrors("tags");
        }
    };

    const handleCreateQuestion = async (data: AskQuestionFormData) => {
        try {
            // Implement your question creation logic here
            console.log("Question data:", data);

            // Example: await createQuestion(data);
        } catch (error) {
            console.error("Failed to create question:", error);
        }
    };

    return (
        <form
            className="flex w-full flex-col gap-10"
            onSubmit={form.handleSubmit(handleCreateQuestion)}
        >
            <FieldGroup>
                <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field
                            data-invalid={fieldState.invalid}
                            className="flex w-full flex-col"
                        >
                            <FieldLabel
                                htmlFor={field.name}
                                className="paragraph-semibold text-dark400_light800"
                            >
                                Question Title <span className="text-primary-500">*</span>
                            </FieldLabel>

                            <Input
                                id={field.name}
                                className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                                aria-invalid={fieldState.invalid}
                                {...field}
                            />

                            <FieldDescription className="body-regular mt-2.5 text-light-500">
                                Be specific and imagine you&apos;re asking a question to another
                                person.
                            </FieldDescription>

                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="content"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field
                            data-invalid={fieldState.invalid}
                            className="flex w-full flex-col"
                        >
                            <FieldLabel
                                htmlFor={field.name}
                                className="paragraph-semibold text-dark400_light800"
                            >
                                Detailed explanation of your problem{" "}
                                <span className="text-primary-500">*</span>
                            </FieldLabel>


                            <Editor
                                value={field.value}
                                editorRef={editorRef}
                                fieldChange={field.onChange}
                            />


                            <FieldDescription className="body-regular mt-2.5 text-light-500">
                                Introduce the problem and expand on what you&apos;ve put in the
                                title.
                            </FieldDescription>

                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="tags"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field
                            data-invalid={fieldState.invalid}
                            className="flex w-full flex-col gap-3"
                        >
                            <FieldLabel
                                htmlFor={field.name}
                                className="paragraph-semibold text-dark400_light800"
                            >
                                Tags <span className="text-primary-500">*</span>
                            </FieldLabel>

                            <div>
                                <Input
                                    id={field.name}
                                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                                    placeholder="Add tags..."
                                    aria-invalid={fieldState.invalid}
                                    onKeyDown={(e) => handleInputKeyDown(e, field.value)}
                                />

                                {field.value.length > 0 && (
                                    <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                                        {field.value.map((tag: string) => (
                                            <TagCard
                                                key={tag}
                                                _id={tag}
                                                name={tag}
                                                compact
                                                remove
                                                isButton
                                                handleRemove={() => handleTagRemove(tag)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <FieldDescription className="body-regular mt-2.5 text-light-500">
                                Add up to 3 tags to describe what your question is about. You
                                need to press enter to add a tag.
                            </FieldDescription>

                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Field orientation="horizontal" className="justify-end">
                    <Button
                        type="submit"
                        className="primary-gradient w-fit text-light-900"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting
                            ? "Submitting..."
                            : "Ask A Question"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    );
};

export default QuestionForm;