import { getServerRanks } from "#achievement/database";
import { IAchievementRank } from "#achievement/models/achievement-rank.model";
import { updateServerAchievementRanksPage } from "#achievement/pagination";
import { CommandInfo } from "#base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import { chunkArray } from "@/helper/common";
import { InteractionPagination } from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { addPagination, getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "list",
  description: "Lists the server ranks",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const ranks = await getServerRanks(data.guild_id);

      if (ranks.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.achievements.server_no_ranks,
        });

        return;
      }

      const chunks = chunkArray<IAchievementRank>(ranks, 10);

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateServerAchievementRanksPage
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);

      logger.log(
        `List achievement ranks in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
