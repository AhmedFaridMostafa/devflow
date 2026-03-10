"use client";

import Image from "next/image";
import { use, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { toggleSaveQuestion } from "@/lib/actions/collection.action";
interface SaveQuestionProps {
  questionId: string;
  userId: string;
  hasSavedQuestionPromise: Promise<ActionResponse<{ saved: boolean }>>;
}
const SaveQuestion = ({
  questionId,
  userId,
  hasSavedQuestionPromise,
}: SaveQuestionProps) => {
  const data = use(hasSavedQuestionPromise);
  const hasSaved = data.success ? data.data.saved : false;
  const [isSave, startSaveTransition] = useTransition();
  const handleSave = () => {
    startSaveTransition(async () => {
      if (!userId) {
        toast.error("You need to be logged in to save a question");
        return;
      }
      try {
        const result = await toggleSaveQuestion({ questionId });

        if (!result.success)
          throw new Error(result.error?.message || "An error occurred");

        toast.success(
          `Question ${result.data?.saved ? "saved" : "unsaved"} successfully`,
        );
      } catch (error) {
        toast.error("Error", {
          description:
            error instanceof Error ? error.message : "An error occurred",
        });
      }
    });
  };

  return (
    <Image
      src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
      width={18}
      height={18}
      alt="save"
      className={cn("cursor-pointer", {
        "opacity-50 pointer-events-none": isSave,
      })}
      aria-label="Save question"
      onClick={() => !isSave && handleSave()}
    />
  );
};

export default SaveQuestion;
