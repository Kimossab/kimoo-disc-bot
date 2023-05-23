import { getAllUserBadges } from "#badges/database";
import { updateUserListBadgesPage } from "#badges/helper";
import { IBadge } from "#badges/models/badges.model";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { chunkArray } from "@/helper/common";
import { InteractionPagination } from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import { getOptions } from "@/helper/modules";
import { addPagination, getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

interface UserOption {
  user: string;
}

const definition: ApplicationCommandOption = {
  name: "user",
  description: "Get user badges",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "user",
      description: "User",
      type: ApplicationCommandOptionType.USER,
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

      const { user } = getOptions<UserOption>(["user"], option.options);
      const userId = user || (data.member || data).user?.id || "";

      const allUserBadges = await getAllUserBadges(userId, data.guild_id);

      if (allUserBadges.length === 0 || allUserBadges[0].badges.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "No badges found",
        });
        return;
      }

      const chunks = chunkArray<IBadge>(allUserBadges[0].badges, 9);

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateUserListBadgesPage,
        userId
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);

      logger.info(
        `List badges for user ${userId} by ${
          (data.member || data).user?.id
        } in ${data.guild_id} by ${(data.member || data).user?.username}#${
          (data.member || data).user?.discriminator
        }`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
