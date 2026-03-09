"use client";

import Image from "next/image";
import { use, useTransition } from "react";
import { toast } from "sonner";
import { createVote } from "@/lib/actions/vote.action";
import { formatNumber } from "@/lib/utils";

interface VotesProps {
  targetType: "question" | "answer";
  userId?: string;
  targetId: string;
  upvotes: number;
  downvotes: number;
  hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
}

const Votes = ({
  upvotes,
  downvotes,
  hasVotedPromise,
  targetId,
  targetType,
  userId,
}: VotesProps) => {
  const votedResult = use(hasVotedPromise);

  const [isVoting, startVoteTransition] = useTransition();

  const { hasUpvoted, hasDownvoted } = votedResult.success
    ? votedResult.data
    : { hasUpvoted: false, hasDownvoted: false };

  const handleVote = (voteType: "upvote" | "downvote") => {
    startVoteTransition(async () => {
      if (!userId) {
        toast.error("Please login to vote", {
          description: "Only logged-in users can vote.",
        });
        return;
      }

      try {
        const result = await createVote({
          targetId,
          targetType,
          voteType,
        });

        if (!result.success) {
          toast.error("Failed to vote", {
            description: result.error?.message,
          });
          return;
        }

        const successMessage =
          voteType === "upvote"
            ? `Upvote ${!hasUpvoted ? "added" : "removed"} successfully`
            : `Downvote ${!hasDownvoted ? "added" : "removed"} successfully`;

        toast(successMessage, {
          description: "Your vote has been recorded.",
        });
      } catch (error) {
        console.error("Error voting:", error);
        toast.error("Failed to vote", {
          description:
            "An error occurred while voting. Please try again later.",
        });
      }
    });
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={
            votedResult.success && hasUpvoted
              ? "/icons/upvoted.svg"
              : "/icons/upvote.svg"
          }
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isVoting && "opacity-50"}`}
          aria-label="Upvote"
          onClick={() => !isVoting && handleVote("upvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(upvotes)}
          </p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={
            votedResult.success && hasDownvoted
              ? "/icons/downvoted.svg"
              : "/icons/downvote.svg"
          }
          width={18}
          height={18}
          alt="downvote"
          className={`cursor-pointer ${isVoting && "opacity-50"}`}
          aria-label="Downvote"
          onClick={() => !isVoting && handleVote("downvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(downvotes)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Votes;
