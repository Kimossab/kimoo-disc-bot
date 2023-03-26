import {
  createRank,
  getRankByName,
  getRankByPoints,
} from "#achievement/database";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { checkAdmin, stringReplacer } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptionValue } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "create",
  description: "Creates a new rank",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "name",
      description: "Rank name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "points",
      description: "Points necessary to achieve this rank",
      type: ApplicationCommandOptionType.INTEGER,
      required: true,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      if (!checkAdmin(data.guild_id, data.member)) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.common.no_permission,
        });
        return;
      }

      const name = getOptionValue<string>(option.options, "name");
      const points = getOptionValue<number>(option.options, "points");

      if (name === null || points === null) {
        return;
      }

      const rankByName = await getRankByName(data.guild_id, name);
      const rankByPoint = await getRankByPoints(data.guild_id, points);

      if (rankByName) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.achievements.rank_exists, {
            name,
          }),
        });
        return;
      }

      if (rankByPoint) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.achievements.rank_point_exists, {
            points,
            name: rankByPoint.name,
          }),
        });
        return;
      }

      await createRank(data.guild_id, name, points);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.rank_create_success, {
          points,
          name,
        }),
      });

      logger.log(
        `Create achievement rank ${name} with ${points} points in ${data.guild_id} by ${data.member?.user?.username}#${data.member?.user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
