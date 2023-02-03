import { getAllBadges } from "#badges/database";
import { updateListBadgesPage } from "#badges/helper";
import { IBadge } from "#badges/models/badges.model";
import { CommandInfo } from "#base-module";

import { chunkArray } from "@/helper/common";
import { InteractionPagination } from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import { addPagination, getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "list",
  description: "List badges from the user or the server",
  type: ApplicationCommandOptionType.SUB_COMMAND,
};

const handler = (logger: Logger): CommandHandler => {
  return async (data) => {
    const app = getApplication();

    if (app && app.id && data.guild_id) {
      const badges = await getAllBadges(data.guild_id);

      const chunks = chunkArray<IBadge>(badges, 9);

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateListBadgesPage
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);

      logger.log(
        `List badges in ${data.guild_id} by ${
          (data.member || data).user?.username
        }#${(data.member || data).user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
