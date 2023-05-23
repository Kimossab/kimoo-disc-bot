import { checkBadgeUser, getByName, giveBadge } from "#badges/database";
import { giveBadgeEmbed } from "#badges/helper";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

import { getAverageColor } from "fast-average-color-node";

interface GiveCommandOptions {
  name: string;
  user: string;
}

const definition: ApplicationCommandOption = {
  name: "give",
  description: "Give a badge to a user",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "name",
      description: "Badge name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "user",
      description: "User",
      type: ApplicationCommandOptionType.USER,
      required: true,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const { user, name } = getOptions<GiveCommandOptions>(
        ["user", "name"],
        option.options
      );
      if (!user || !name) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.badges.not_found,
        });
        return;
      }

      const badge = await getByName(name, data.guild_id);

      if (!badge) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.badges.not_found,
        });
        return;
      }

      const userHasBadge = await checkBadgeUser(badge, user, data.guild_id);

      if (userHasBadge) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "User already has this badge.",
        });
        return;
      }

      const userBadge = await giveBadge(badge, user, data.guild_id);

      if (!userBadge) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.common.internal_error,
        });
        return;
      }

      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          embeds: [
            giveBadgeEmbed(
              badge.name,
              `${badge._id}${badge.fileExtension}`,
              user,
              await getAverageColor(`badges/${badge._id}${badge.fileExtension}`)
            ),
          ],
        },
        `badges/${badge._id}${badge.fileExtension}`
      );

      logger.info(
        `Given badge ${name} to ${user} in ` +
          `${data.guild_id} by ${(data.member || data).user?.username}#${
            (data.member || data).user?.discriminator
          }`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  isAdmin: true,
});
