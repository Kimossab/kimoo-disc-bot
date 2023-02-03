import { getServerAchievementLeaderboard } from "#achievement/database";
import { updateServerLeaderboardPage } from "#achievement/pagination";
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
  name: "leaderboard",
  description: "Shows the server leaderboard",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [],
};

const handler = (logger: Logger): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const allAch = await getServerAchievementLeaderboard(data.guild_id);

      const chunks = chunkArray<achievement.serverLeaderboard>(allAch, 10);

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateServerLeaderboardPage
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);

      logger.log(
        `Get server rank leaderboard in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
