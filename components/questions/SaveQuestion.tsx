"use client";

import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { toggleSaveQuestion } from "@/lib/actions/collection.action";

const SaveQuestion = ({
  questionId,
  userId,
}: {
  questionId: string;
  userId: string;
}) => {
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

  const hasSaved = false;

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
