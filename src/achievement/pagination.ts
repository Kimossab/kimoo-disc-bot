import { stringReplacer } from "../helper/common";
import { IUserAchievement } from "./models/user-achievement.model";
import messageList from "../helper/messages";
import { IAchievementRank } from "./models/achievement-rank.model";
import { IAchievement } from "./models/achievement.model";
import { Embed, EmbedField } from "../types/discord";
import { CreatePageCallback } from "../helper/interaction-pagination";

// PAGINATION
// user achievement
export const createUserAchievementsEmbed = (
  data: IUserAchievement[],
  page: number,
  total: number
): Embed => {
  const embed: Embed = {
    title: messageList.achievements.user_achievements,
    color: 3035554,
    description: `<@${data[0].user}>\n`,
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    };
  }

  for (const ach of data) {
    embed.description += `${ach.achievement.id} - `;
    if (ach.achievement.image) {
      embed.description += `[${ach.achievement.name}](${ach.achievement.image})`;
    } else {
      embed.description += ach.achievement.name;
    }

    embed.description += ` - ${"★".repeat(
      ach.achievement.points
    )} - ${ach.awardDate.toLocaleDateString()}\n`;
  }

  return embed;
};

export const updateUserAchievementsPage: CreatePageCallback<
  IUserAchievement[]
> = async (page, total, data) => ({
  data: {
    embeds: [
      createUserAchievementsEmbed(data, page, total),
    ],
  },
});

// server achievements
export const createServerAchievementsEmbed = (
  data: IAchievement[],
  page: number,
  total: number
): Embed => {
  const embed: Embed = {
    title: messageList.achievements.server_achievements,
    color: 3035554,
    description: "",
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    };
  }

  for (const ach of data) {
    embed.description += `${ach.id} - `;
    if (ach.image) {
      embed.description += `[${ach.name}](${ach.image}))`;
    } else {
      embed.description += ach.name;
    }
    if (ach.description) {
      embed.description += ` - ${ach.description}`;
    }
    embed.description += ` - ${"★".repeat(ach.points)}\n`;
  }

  return embed;
};

export const updateServerAchievementsPage: CreatePageCallback<
  IAchievement[]
> = async (page, total, data) => ({
  data: {
    embeds: [
      createServerAchievementsEmbed(data, page, total),
    ],
  },
});
// server ranks
export const createServerAchievementRanksEmbed = (
  data: IAchievementRank[],
  page: number,
  total: number
): Embed => {
  const embed: Embed = {
    title:
      messageList.achievements.server_achievement_ranks,
    color: 3035554,
    description: "",
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    };
  }

  for (const rank of data) {
    embed.description += `${rank.name} - ★X${rank.points}\n`;
  }

  return embed;
};

export const updateServerAchievementRanksPage: CreatePageCallback<
  IAchievementRank[]
> = async (page, total, data) => ({
  data: {
    embeds: [
      createServerAchievementRanksEmbed(data, page, total),
    ],
  },
});

// leaderboard
export const createServerLeaderboardEmbed = (
  data: achievement.serverLeaderboard[],
  page: number,
  total: number
): Embed => {
  const fields: EmbedField[] = [
    {
      name: "• Positions",
      value: "",
    },
  ];

  const embed: Embed = {
    title: messageList.achievements.serverLeaderboard,
    color: 3035554,
    fields: fields,
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    };
  }

  for (let i = 0; i < data.length; i++) {
    const element = data[i];

    fields[0].value += `• \`${
      (page - 1) * 10 + i + 1
    }\` • \`${element.rank} - ${element.points} Pts.\` <@${
      element.user
    }>\n`;
  }

  return embed;
};

export const updateServerLeaderboardPage: CreatePageCallback<
  achievement.serverLeaderboard[]
> = async (page, total, data) => ({
  data: {
    embeds: [
      createServerLeaderboardEmbed(data, page, total),
    ],
  },
});
