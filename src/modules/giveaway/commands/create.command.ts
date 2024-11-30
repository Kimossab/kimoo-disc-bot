import { CommandHandler, CommandInfo, ComponentCommandHandler } from "#base-module";
import {
  CompleteGiveaway,
  createGiveaway,
  createParticipant,
  getGiveaway,
  removeParticipant,
  removeWinnerAndDisable,
  setWinner,
  updateHash
} from "#giveaway/database";
import { createGiveawayMessageData } from "#giveaway/helpers/createGiveawayMessage";
import { announceVictor } from "#giveaway/helpers/GiveawayManager";

import {
  createInteractionResponse,
  editMessage,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { randomNum } from "@/helper/common";
import { ILogger } from "@/helper/logger";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import { APIApplicationCommandOption, ApplicationCommandOptionType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";

interface CreateCommandOptions {
  prize: string;
  time: number;
}

const definition: APIApplicationCommandOption = {
  name: "create",
  description: "Create a new giveaway",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "prize",
      description: "What you're giving away.",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "time",
      description: "Number of days the giveaway will be active.",
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
      required: true
    }
  ]
};

const handler = (
  logger: ILogger,
  created: (giveaway: CompleteGiveaway) => void
): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id && data.member?.user) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource
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
        channelId: data.channel.id!,
        creatorId: data.member.user.id,
        hash,
        endAt,
        prize
      });

      const message = await editOriginalInteractionResponse(
        app.id,
        data.token,
        createGiveawayMessageData(giveaway)
      );

      const nGiveaway = await updateHash(giveaway.id, message?.id ?? hash);

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
      logger.error("Giveaway not found.", { data,
        messageId,
        subCmd });
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "Internal Server Error, try again",
          flags: MessageFlags.Ephemeral
        }
      });
      return;
    }

    switch (subCmd[0]) {
      case "reshuffle":
        if (giveaway.creatorId !== data.member?.user?.id) {
          await createInteractionResponse(data.id, data.token, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: "You're not the creator of the giveaway.",
              flags: MessageFlags.Ephemeral
            }
          });
        } else {
          const oldWinner = giveaway.participants.find((p) => p.isWinner);
          if (oldWinner) {
            await removeWinnerAndDisable(oldWinner.id);
          }

          const newParticipants = giveaway.participants.filter((p) => p.canWin && p.id != oldWinner?.id);

          const winnerIdx = randomNum(0, newParticipants.length - 1);
          const winner = newParticipants[winnerIdx];
          await setWinner(winner.id);
          giveaway = await getGiveaway(giveaway.hash);
          await announceVictor(giveaway!);
        }
        break;
      case "join":
        const participant = giveaway.participants.find((p) => p.userId == data.member?.user?.id);
        if (participant) {
          await removeParticipant(participant.id);
          await createInteractionResponse(data.id, data.token, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: "You've left the giveaway",
              flags: MessageFlags.Ephemeral
            }
          });
        } else {
          await createParticipant({
            userId: data.member!.user!.id,
            canWin: true,
            giveawayId: giveaway.id,
            isWinner: false
          });
          await createInteractionResponse(data.id, data.token, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: "You've joined the giveaway",
              flags: MessageFlags.Ephemeral
            }
          });
        }
        giveaway = await getGiveaway(giveaway.hash);
        break;
    }

    await editMessage(data.channel_id ?? "", messageId, {
      ...createGiveawayMessageData(giveaway!),
      attachments: undefined
    });
  };
};

export default (
  logger: ILogger,
  created: (giveaway: CompleteGiveaway) => void
): CommandInfo => ({
  definition,
  handler: handler(logger, created),
  componentHandler: componentHandler(logger)
});
