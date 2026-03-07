"use server";

export async function hasVoted(
  params: HasVotedParams,
): Promise<ActionResponse<HasVotedResponse>> {
  console.log("Checking if user has voted with params:", params);
  return {
    success: true,
    data: {
      hasUpvoted: true,
      hasDownvoted: true,
    },
  };
}

export async function createVote(
  params: CreateVoteParams,
): Promise<ActionResponse> {
  console.log("Creating vote with params:", params);
  return { success: true, data: null };
}
