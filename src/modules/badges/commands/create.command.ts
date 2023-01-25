import { checkName, createBadge } from "#badges/database";
import { createdBadgeEmbed } from "#badges/helper";
import { CommandInfo } from "#base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import { deleteFile, moveFile } from "@/helper/common";
import { downloadImage } from "@/helper/images";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication, getChannelLastAttachment } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

import { getAverageColor } from "fast-average-color-node";

interface CreateCommandOptions {
  name: string;
  image: string;
}

const definition: ApplicationCommandOption = {
  name: "create",
  description: "Create a new badge",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "name",
      description: "Badge name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "image",
      description: "Badge image",
      type: ApplicationCommandOptionType.STRING,
    },
  ],
};
const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id) {
      const { name, image } = getOptions<CreateCommandOptions>(
        ["name", "image"],
        option.options
      );
      const lastAttachment = getChannelLastAttachment(data.channel_id);
      const url = image ?? lastAttachment;

      if (!url) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.common.no_image,
        });
        return;
      }

      if (!name || (await checkName(name, data.guild_id))) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "Badge with that name already exists.",
        });
        return;
      }

      const imagePath = await downloadImage(url, `trash/${name}`);

      if (!imagePath.success) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "URL is not an image or image is too big (max 20MB)",
        });
        return;
      }

      const badge = await createBadge(
        name || `${new Date()}`,
        data.guild_id,
        imagePath.extension
      );

      if (!badge) {
        await deleteFile(`trash/${name}`);

        await editOriginalInteractionResponse(app.id, data.token, {
          content: "Something went wrong",
        });
        return;
      }

      await moveFile(
        `trash/${name}`,
        `badges/${badge._id}${imagePath.extension}`
      );

      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          embeds: [
            createdBadgeEmbed(
              name,
              `${badge._id}${imagePath.extension}`,
              await getAverageColor(`badges/${badge._id}${imagePath.extension}`)
            ),
          ],
        },
        `badges/${badge._id}${imagePath.extension}`
      );

      logger.log(
        `Create badge in ${data.guild_id} by ${
          (data.member || data).user?.username
        }#${(data.member || data).user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  isAdmin: true,
});
