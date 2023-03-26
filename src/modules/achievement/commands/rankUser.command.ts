import { getAllUserAchievements, getServerRanks } from "#achievement/database";
import {
  createAchievementRankProgressEmbed,
  getCurrentAndNextRank,
  getTotalPoints,
} from "#achievement/helper";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
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
  name: "user",
  description: "Shows the rank of a user",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "user",
      description: "User to get the rank of",
      type: ApplicationCommandOptionType.USER,
    },
  ],
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const optUser = getOptionValue<string>(option.options, "user");

      const user = optUser || data.member.user?.id || "unknown-id";

      const achievements = await getAllUserAchievements(data.guild_id, user);
      if (achievements.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.achievements.user_no_achievements,
        });

        return;
      }
      const serverRanks = await getServerRanks(data.guild_id);
      if (serverRanks.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.achievements.server_no_ranks,
        });

        return;
      }

      const totalPoints = getTotalPoints(achievements);
      const ranks = getCurrentAndNextRank(totalPoints, serverRanks);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: "",
        embeds: [
          createAchievementRankProgressEmbed(
            user,
            totalPoints,
            ranks.current,
            ranks.next
          ),
        ],
      });
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler(),
});
