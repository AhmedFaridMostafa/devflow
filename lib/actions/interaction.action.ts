import { Interaction, User } from "@/database";
import { IInteractionDoc } from "@/database/interaction.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { CreateInteractionSchema } from "../validations";
import withTransaction from "../handlers/transaction";
import { type Serialize, serialize } from "../utils";

export async function createInteraction(
  params: CreateInteractionParams,
): Promise<ActionResponse<Serialize<IInteractionDoc>>> {
  const validationResult = await action({
    params,
    schema: CreateInteractionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult);

  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId,
  } = validationResult.params;
  const userId = validationResult.session.user.id;

  try {
    const interaction = await withTransaction(async (session) => {
      const [interaction] = await Interaction.create(
        [
          {
            user: userId,
            action: actionType,
            actionId,
            actionType: actionTarget,
          },
        ],
        { session },
      );

      // Update reputation for both the performer and the content author
      await updateReputation({
        interaction,
        session,
        performerId: userId!,
        authorId,
      });

      return interaction;
    });

    return { success: true, data: serialize(interaction) };
  } catch (error) {
    return handleError(error);
  }
}

async function updateReputation(params: UpdateReputationParams) {
  const { interaction, session, performerId, authorId } = params;
  const { action, actionType } = interaction;

  let performerPoints = 0;
  let authorPoints = 0;

  switch (action) {
    case "upvote":
      performerPoints = 2;
      authorPoints = 10;
      break;
    case "downvote":
      performerPoints = -1;
      authorPoints = -2;
      break;
    case "post":
      authorPoints = actionType === "question" ? 5 : 10;
      break;
    case "delete":
      authorPoints = actionType === "question" ? -5 : -10;
      break;
    default:
      return;
  }

  if (performerId === authorId) {
    await User.findByIdAndUpdate(
      performerId,
      { $inc: { reputation: authorPoints } },
      { session },
    );
    return;
  }

  const updates = [
    {
      updateOne: {
        filter: { _id: authorId },
        update: { $inc: { reputation: authorPoints } },
      },
    },
  ];

  if (performerPoints !== 0) {
    updates.push({
      updateOne: {
        filter: { _id: performerId },
        update: { $inc: { reputation: performerPoints } },
      },
    });
  }

  await User.bulkWrite(updates, { session });
}
