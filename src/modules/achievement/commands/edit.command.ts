import { updateAchievement } from "#achievement/database";
import { CommandInfo } from "#base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import { stringReplacer } from "@/helper/common";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

interface EditCommandOptions {
  id: Nullable<number>;
  name: Nullable<string>;
  description: Nullable<string>;
  points: Nullable<number>;
  image: Nullable<string>;
}

const definition: ApplicationCommandOption = {
  name: "edit",
  description: "Updates an achievement (admin only)",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "id",
      description: "Achievement id",
      type: ApplicationCommandOptionType.INTEGER,
      required: true,
    },
    {
      name: "name",
      description: "Achievement name",
      type: ApplicationCommandOptionType.STRING,
    },
    {
      name: "description",
      description: "Achievement description",
      type: ApplicationCommandOptionType.STRING,
    },
    {
      name: "points",
      description: "Achievement point value",
      type: ApplicationCommandOptionType.INTEGER,
    },
    {
      name: "image",
      description: "Achievement image URL",
      type: ApplicationCommandOptionType.STRING,
    },
  ],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const { id, name, description, points, image } =
        getOptions<EditCommandOptions>(
          ["id", "name", "description", "points", "image"],
          option.options
        );

      if (!id) {
        return;
      }

      const achievement = await updateAchievement(
        data.guild_id,
        id,
        name,
        image,
        description,
        points
      );

      if (!achievement) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.achievements.not_found, {
            id,
          }),
        });
        return;
      }

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.update_success, {
          name: achievement.name,
        }),
      });

      logger.log(
        `Updated achievement ${achievement.id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`,
        achievement
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  isAdmin: true,
});
