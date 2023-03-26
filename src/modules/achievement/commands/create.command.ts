import { createAchievement, getAchievement } from "#achievement/database";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { stringReplacer } from "@/helper/common";
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

interface CreateCommandOptions {
  name: Nullable<string>;
  image: Nullable<string>;
  description: Nullable<string>;
  points: Nullable<number>;
}

const definition: ApplicationCommandOption = {
  name: "create",
  description: "Creates a new achievement (admin only)",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "name",
      description: "Achievement name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "description",
      description: "Achievement description",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "points",
      description: "Achievement point value",
      type: ApplicationCommandOptionType.INTEGER,
      required: true,
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
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const { name, image, description, points } =
        getOptions<CreateCommandOptions>(
          ["name", "image", "description", "points"],
          option.options
        );

      if (!name) {
        return;
      }

      const achievement = await getAchievement(data.guild_id, name);

      if (achievement) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.achievements.already_exists,
        });
        return;
      }

      await createAchievement(data.guild_id, name, image, description, points);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.create_success, {
          name,
        }),
      });

      logger.log(
        `Create achievement ${name} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  isAdmin: true,
});
