import {
  createUserAchievement,
  getAchievementById,
  getAllUserAchievements,
  getServerRanks,
  getUserAchievement,
} from "#achievement/database";
import {
  createAchievementGivenEmbed,
  createAchievementRankProgressEmbed,
  getCurrentAndNextRank,
  getTotalPoints,
} from "#achievement/helper";
import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { stringReplacer } from "@/helper/common";
import { no_mentions } from "@/helper/constants";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

interface GiveCommandOptions {
  user: Nullable<string>;
  achievement: Nullable<number>;
}

const definition: ApplicationCommandOption = {
  name: "give",
  description: "Gives an achievement to a user (Admin only)",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "user",
      description: "User to give the achievement to",
      type: ApplicationCommandOptionType.USER,
      required: true,
    },
    {
      name: "achievement",
      description: "Achievement id to give to the user",
      type: ApplicationCommandOptionType.INTEGER,
      required: true,
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

      const { user, achievement } = getOptions<GiveCommandOptions>(
        ["user", "achievement"],
        option.options
      );

      if (!user || !achievement) {
        return;
      }

      const ach = await getAchievementById(data.guild_id, achievement);
      if (!ach) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.achievements.not_found, {
            id: achievement,
          }),
        });

        return;
      }

      const userAch = await getUserAchievement(data.guild_id, user, ach._id);
      if (userAch) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.achievements.already_got, {
            user: `<@${user}>`,
            id: achievement,
          }),
          allowed_mentions: no_mentions,
        });

        return;
      }

      await createUserAchievement(data.guild_id, user, ach, ach._id);

      const achievements = await getAllUserAchievements(data.guild_id, user);
      const serverRanks = await getServerRanks(data.guild_id);

      const totalPoints = getTotalPoints(achievements);
      const ranks = getCurrentAndNextRank(totalPoints, serverRanks);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.given_success, {
          user: `<@${user}>`,
          name: `\`${ach.name}\``,
        }),
        embeds: [
          createAchievementGivenEmbed(ach),
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
  isAdmin: true,
});
