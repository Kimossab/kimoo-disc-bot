import { CommandInfo } from "#base-module";
import { createGiveaway, getGiveaway } from "#giveaway/database";
import { createGiveawayMessageData } from "#giveaway/helpers/createGiveawayMessage";
import { announceVictor } from "#giveaway/helpers/GiveawayManager";
import { IGiveawayDocument } from "#giveaway/models/Giveaway.model";

import {
  createInteractionResponse,
  editMessage,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { randomNum } from "@/helper/common";
import { ILogger } from "@/helper/logger";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  ComponentCommandHandler,
  InteractionCallbackDataFlags,
  InteractionCallbackType,
} from "@/types/discord";

interface CreateCommandOptions {
  prize: string;
  time: number;
}

const definition: ApplicationCommandOption = {
  name: "create",
  description: "Create a new giveaway",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "prize",
      description: "What you're giving away.",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "time",
      description: "Number of days the giveaway will be active.",
      type: ApplicationCommandOptionType.INTEGER,
      min_value: 1,
      required: true,
    },
  ],
};

const handler = (
  logger: ILogger,
  created: (giveaway: IGiveawayDocument) => void
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id && data.member?.user) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const { prize, time } = getOptions<CreateCommandOptions>(
        ["prize", "time"],
        option.options
      );

      const hash = `${+new Date()}`;
      const endAt = new Date();
      endAt.setDate(endAt.getDate() + time);

      const giveaway = await createGiveaway({
        serverId: data.guild_id!,
        channelId: data.channel_id!,
        creatorId: data.member.user.id,
        hash,
        endAt,
        participants: [],
        prize,
        winner: null,
      });

      const message = await editOriginalInteractionResponse(
        app.id,
        data.token,
        createGiveawayMessageData(giveaway)
      );

      giveaway.hash = message?.id ?? hash;

      const nGiveaway = await giveaway.save();

      logger.info("New giveaway created", giveaway);

      created(nGiveaway);
    }
  };
};

const componentHandler = (logger: ILogger): ComponentCommandHandler => {
  return async (data, subCmd) => {
    const messageId = data.message?.id ?? "";

    let giveaway = await getGiveaway(messageId);

    logger.info("Component interaction", subCmd);

    if (!giveaway) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Internal Server Error, try again",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return;
    }

    switch (subCmd[0]) {
      case "reshuffle":
        if (giveaway.creatorId !== data.member?.user?.id) {
          await createInteractionResponse(data.id, data.token, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "You're not the creator of the giveaway.",
              flags: InteractionCallbackDataFlags.EPHEMERAL,
            },
          });
        } else {
          const newParticipants = giveaway.participants.filter(
            (p) => p !== giveaway!.winner
          );

          const winner = randomNum(0, newParticipants.length - 1);

          giveaway.participants = newParticipants;
          giveaway.winner = newParticipants[winner];
          giveaway = await giveaway.save();
          await announceVictor(giveaway);
        }
        break;
      case "join":
        if (giveaway.participants.includes(data.member?.user?.id ?? "")) {
          giveaway.participants = giveaway.participants.filter(
            (p) => p !== (data.member?.user?.id ?? "")
          );

          giveaway = await giveaway.save();
          await createInteractionResponse(data.id, data.token, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "You've left the giveaway",
              flags: InteractionCallbackDataFlags.EPHEMERAL,
            },
          });
        } else {
          giveaway.participants.push(data.member?.user?.id ?? "");

          giveaway = await giveaway.save();
          await createInteractionResponse(data.id, data.token, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "You've joined the giveaway",
              flags: InteractionCallbackDataFlags.EPHEMERAL,
            },
          });
        }
        break;
    }

    await editMessage(data.channel_id ?? "", messageId, {
      ...createGiveawayMessageData(giveaway),
      attachments: undefined,
    });
  };
};

export default (
  logger: ILogger,
  created: (giveaway: IGiveawayDocument) => void
): CommandInfo => ({
  definition,
  handler: handler(logger, created),
  componentHandler: componentHandler(logger),
});
