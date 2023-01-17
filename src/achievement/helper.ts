import { stringReplacer } from "../helper/common";
import messageList from "../helper/messages";
import { Embed } from "../types/discord";
import { IAchievement } from "./models/achievement.model";
import { IAchievementRank } from "./models/achievement-rank.model";
import { IUserAchievement } from "./models/user-achievement.model";

export const getTotalPoints = (data: IUserAchievement[]): number => {
  let count = 0;
  for (const ach of data) {
    count += ach.achievement.points;
  }

  return count;
};

interface CurrentAndNextRank {
  current: IAchievementRank | null;
  next: IAchievementRank | null;
}

export const getCurrentAndNextRank = (
  points: number,
  ranks: IAchievementRank[]
): CurrentAndNextRank => {
  let current: IAchievementRank | null = null;
  let next: IAchievementRank | null = null;

  for (const rank of ranks) {
    if (
      rank.points <= points &&
      (current === null || rank.points > current.points)
    ) {
      current = rank;
    } else if (
      rank.points > points &&
      (next === null || rank.points < next.points)
    ) {
      next = rank;
    }
  }

  return {
    current,
    next,
  };
};

export const createProgressBar = (
  value: number,
  max: number,
  steps: number
): string => {
  const prog = Math.round((value * steps) / max);

  const bar = `\`\`\`⠀\n${"▓".repeat(prog)}${"░".repeat(
    steps - prog
  )}\n${Math.round((prog * 100) / steps)}%\`\`\``;

  return bar;
};

export const createAchievementGivenEmbed = (
  achievement: IAchievement
): Embed => {
  const descMessage = stringReplacer(
    messageList.achievements.new_achievement_awarded_desc,
    {
      name: achievement.name,
      description: achievement.description,
      points: achievement.points,
    }
  );

  const embed: Embed = {
    title: messageList.achievements.new_achievement_awarded,
    description: descMessage,
  };

  if (achievement.image) {
    embed.image = {
      url: achievement.image,
    };
  }

  return embed;
};

export const createAchievementRankProgressEmbed = (
  user: string,
  points: number,
  currentRank: IAchievementRank | null,
  nextRank: IAchievementRank | null
): Embed => {
  const curRankPoints = currentRank?.points || 0;
  const nextRankPoints = nextRank?.points || 0;

  const progBar = nextRank
    ? createProgressBar(
        points - curRankPoints,
        nextRankPoints - curRankPoints,
        40
      )
    : "";

  let description = `<@${user}>\n`;
  description += `**Points**: ${points}\n`;
  if (currentRank) {
    description += `**Rank**: ${currentRank.name}\n`;
  }
  if (nextRank) {
    description += `**Next Rank**: ${nextRank.name} @${nextRank.points} points\n`;
  }

  description += progBar;

  const embed: Embed = {
    title: messageList.achievements.progress,
    description,
  };

  return embed;
};
