import {
  createInteractionResponse,
  editMessage,
  sendMessage
} from "../discord/rest";
import { checkAdmin, chunkArray, stringReplacer } from "../helper/common";
import { interaction_response_type, no_mentions } from "../helper/constants";
import Logger from "../helper/logger";
import { addPagination, setCommandExecutedCallback } from "../state/actions";
import messageList from "../helper/messages";
import {
  createAchievement,
  createRank,
  createUserAchievement,
  getAchievement,
  getAchievementById,
  getAllUserAchievements,
  getRankByName,
  getRankByPoints,
  getServerAchievementLeaderboard,
  getServerAchievements,
  getServerRanks,
  getUserAchievement
} from "../controllers/achievement.controller";
import { IAchievement } from "../models/achievement.model";
import Pagination from "../helper/pagination";
import { IAchievementRank } from "../models/achievement-rank.model";
import { IUserAchievement } from "../models/user-achievement.model";

const _logger = new Logger("birthday");

let firstSetup: boolean = true;

// HELPERS
const getTotalPoints = (data: IUserAchievement[]): number => {
  let count = 0;
  for (const ach of data) {
    count += ach.achievement.points;
  }

  return count;
};

const getCurrentAndNextRank = (
  points: number,
  ranks: IAchievementRank[]
): { current: IAchievementRank | null; next: IAchievementRank | null } => {
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
    next
  };
};

const createProgressBar = (
  value: number,
  max: number,
  steps: number
): string => {
  const prog = Math.round((value * steps) / max);

  let bar =
    "```⠀\n" +
    "▓".repeat(prog) +
    "░".repeat(steps - prog) +
    `\n${Math.round((prog * 100) / steps)}%\`\`\``;

  return bar;
};

const createAchievementGivenEmbed = (
  achievement: IAchievement
): discord.embed => {
  const embed: discord.embed = {
    title: "New achievement awarded",
    description: `${achievement.name} - ${achievement.description}\nAwarded ${achievement.points} points`,
    image: {
      url: achievement.image
    }
  };

  return embed;
};

const createAchievementRankProgressEmbed = (
  user: string,
  points: number,
  currentRank: IAchievementRank | null,
  nextRank: IAchievementRank | null
): discord.embed => {
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

  const embed: discord.embed = {
    title: "Achievement progress",
    description
  };

  return embed;
};

// PAGES
const createUserAchievementsEmbed = (
  data: IUserAchievement[],
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: "User Achievements",
    color: 3035554,
    description: `<@${data[0].user}>\n`
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total })
    };
  }

  for (const ach of data) {
    embed.description += `${ach.achievement.id} - [${ach.achievement.name}](${ach.achievement.image})`;

    embed.description +=
      " - " +
      "★".repeat(ach.achievement.points) +
      ` - ${ach.awardDate.toLocaleDateString()}\n`;
  }

  return embed;
};

const updateUserAchievementsPage = async (
  channel: string,
  message: string,
  data: IUserAchievement[],
  page: number,
  total: number
): Promise<void> => {
  await editMessage(
    channel,
    message,
    "",
    createUserAchievementsEmbed(data, page, total)
  );
};

const createServerAchievementsEmbed = (
  data: IAchievement[],
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: "Server Achievements",
    color: 3035554,
    description: ""
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total })
    };
  }

  for (const ach of data) {
    embed.description += `${ach.id} - [${ach.name}](${ach.image})`;
    if (ach.description) {
      embed.description += ` - ${ach.description}`;
    }
    embed.description += " - " + "★".repeat(ach.points) + "\n";
  }

  return embed;
};

const updateServerAchievementsPage = async (
  channel: string,
  message: string,
  data: IAchievement[],
  page: number,
  total: number
): Promise<void> => {
  await editMessage(
    channel,
    message,
    "",
    createServerAchievementsEmbed(data, page, total)
  );
};

const createServerAchievementRanksEmbed = (
  data: IAchievementRank[],
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: "Server Achievement Ranks",
    color: 3035554,
    description: ""
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total })
    };
  }

  for (const rank of data) {
    embed.description += `${rank.name} - ★X${rank.points}\n`;
  }

  return embed;
};

const updateServerAchievementRanksPage = async (
  channel: string,
  message: string,
  data: IAchievementRank[],
  page: number,
  total: number
): Promise<void> => {
  await editMessage(
    channel,
    message,
    "",
    createServerAchievementRanksEmbed(data, page, total)
  );
};
const createServerLeaderboardEmbed = (
  data: achievement.server_leaderboard[],
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: "Server Achievement Leaderboard",
    color: 3035554,
    // description: "\n"
    fields: [
      {
        name: "• Positions",
        value: ""
      }
    ]
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total })
    };
  }

  for (let i = 0; i < data.length; i++) {
    const element = data[i];

    embed.fields![0].value += `• \`${(page - 1) * 10 + i + 1}\` • \`${
      element.rank
    } - ${element.points} Pts.\` <@${element.user}>\n`;
  }

  return embed;
};

const updateServerLeaderboardPage = async (
  channel: string,
  message: string,
  data: achievement.server_leaderboard[],
  page: number,
  total: number
): Promise<void> => {
  await editMessage(
    channel,
    message,
    "",
    createServerLeaderboardEmbed(data, page, total)
  );
};

// COMMANDS
const create = async (data: discord.interaction) => {
  if (!checkAdmin(data.guild_id, data.member)) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.channel_message_with_source,
      data: {
        content: messageList.common.no_permission
      }
    });
    return;
  }

  const opts = data.data!.options![0].options;

  const achName = opts?.find(o => o.name === "name");
  const achImg = opts?.find(o => o.name === "image");
  const achDesc = opts?.find(o => o.name === "description");
  const achPoints = opts?.find(o => o.name === "points");

  const achievement = await getAchievement(data.guild_id, achName?.value);

  if (achievement) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.channel_message_with_source,
      data: {
        content: messageList.achievements.already_exists
      }
    });
    return;
  }

  await createAchievement(
    data.guild_id,
    achName?.value,
    achImg?.value,
    achDesc ? achDesc.value : null,
    achPoints?.value
  );

  await createInteractionResponse(data.id, data.token, {
    type: interaction_response_type.channel_message_with_source,
    data: {
      content: stringReplacer(messageList.achievements.create_success, {
        name: achName?.value
      })
    }
  });

  _logger.log(
    `Create achievement ${achName?.value}  in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
  );
};

const rank = async (data: discord.interaction) => {
  const opts = data.data!.options![0].options;

  const optCreate = opts?.find(o => o.name === "create");
  const optList = opts?.find(o => o.name === "list");
  const optUser = opts?.find(o => o.name === "user");
  const optLeaderboard = opts?.find(o => o.name === "leaderboard");

  if (optCreate) {
    const optName = optCreate.options?.find(o => o.name === "name");
    const optPoints = optCreate.options?.find(o => o.name === "points");

    const rankByName = await getRankByName(data.guild_id, optName?.value);
    const rankByPoint = await getRankByPoints(data.guild_id, optPoints?.value);

    if (rankByName) {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.acknowledge_with_source,
        data: {
          content: stringReplacer(messageList.achievements.rank_exists, {
            name: optName?.value
          })
        }
      });
      return;
    }

    if (rankByPoint) {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.acknowledge_with_source,
        data: {
          content: stringReplacer(messageList.achievements.rank_point_exists, {
            points: optPoints?.value,
            name: rankByPoint.name
          })
        }
      });
      return;
    }

    await createRank(data.guild_id, optName?.value, optPoints?.value);

    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source,
      data: {
        content: stringReplacer(messageList.achievements.rank_create_success, {
          points: optPoints!.value,
          name: optName!.name
        })
      }
    });

    _logger.log(
      `Create achievement rank ${optName?.value} with ${optPoints?.value} points in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  } else if (optList) {
    const ranks = await getServerRanks(data.guild_id);

    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source
    });

    const chunks = chunkArray<IAchievementRank>(ranks, 10);

    const embed = createServerAchievementRanksEmbed(
      chunks[0],
      1,
      chunks.length
    );
    const message = await sendMessage(data.channel_id, "", embed);
    if (message && chunks.length > 1) {
      const pagination = new Pagination<IAchievementRank[]>(
        data.channel_id,
        message.id,
        chunks,
        updateServerAchievementRanksPage
      );

      addPagination(pagination);
    }

    _logger.log(
      `List achievement ranks in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  } else if (optUser) {
    let user: string = data.member.user!.id;

    const sUser = optUser.options?.find(o => o.name === "user");
    if (sUser) {
      user = sUser.value;
    }

    const achievements = await getAllUserAchievements(data.guild_id, user);
    const serverRanks = await getServerRanks(data.guild_id);

    const totalPoints = getTotalPoints(achievements);
    const ranks = getCurrentAndNextRank(totalPoints, serverRanks);

    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.channel_message_with_source,
      data: {
        content: " ",
        embeds: [
          createAchievementRankProgressEmbed(
            user,
            totalPoints,
            ranks.current,
            ranks.next
          )
        ]
      }
    });
  } else if (optLeaderboard) {
    const allAch = await getServerAchievementLeaderboard(data.guild_id);

    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source
    });

    const chunks = chunkArray<achievement.server_leaderboard>(allAch, 10);

    const embed = createServerLeaderboardEmbed(chunks[0], 1, chunks.length);
    const message = await sendMessage(data.channel_id, "", embed);
    if (message && chunks.length > 1) {
      const pagination = new Pagination<achievement.server_leaderboard[]>(
        data.channel_id,
        message.id,
        chunks,
        updateServerLeaderboardPage
      );

      addPagination(pagination);
    }

    _logger.log(
      `Get server rank leaderboard in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const list = async (data: discord.interaction) => {
  const opts = data.data!.options![0].options;

  const optServer = opts?.find(o => o.name === "server");
  const optUser = opts?.find(o => o.name === "user");

  if (optServer) {
    const achievs = await getServerAchievements(data.guild_id);

    if (achievs.length === 0) {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.acknowledge_with_source,
        data: {
          content: "Server has no achievements yet"
        }
      });

      return;
    }

    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source
    });

    const chunks = chunkArray<IAchievement>(achievs, 10);

    const embed = createServerAchievementsEmbed(chunks[0], 1, chunks.length);
    const message = await sendMessage(data.channel_id, "", embed);
    if (message && chunks.length > 1) {
      const pagination = new Pagination<IAchievement[]>(
        data.channel_id,
        message.id,
        chunks,
        updateServerAchievementsPage
      );

      addPagination(pagination);
    }

    _logger.log(
      `List server achievements in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  } else {
    const user: string =
      optUser?.options?.find(o => o.name === "user")?.value ||
      data.member.user!.id;

    const achievs = await getAllUserAchievements(data.guild_id, user);

    if (achievs.length === 0) {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.acknowledge_with_source,
        data: {
          content: "User has no achievements yet"
        }
      });

      return;
    }

    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source
    });

    const chunks = chunkArray<IUserAchievement>(achievs, 10);

    const embed = createUserAchievementsEmbed(chunks[0], 1, chunks.length);
    const message = await sendMessage(data.channel_id, "", embed);
    if (message && chunks.length > 1) {
      const pagination = new Pagination<IUserAchievement[]>(
        data.channel_id,
        message.id,
        chunks,
        updateUserAchievementsPage
      );

      addPagination(pagination);
    }

    _logger.log(
      `List user ${user} achievements in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const give = async (data: discord.interaction) => {
  if (!checkAdmin(data.guild_id, data.member)) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.channel_message_with_source,
      data: {
        content: messageList.common.no_permission
      }
    });
    return;
  }

  const opts = data.data!.options![0].options;

  const optAch = opts?.find(o => o.name === "achievement");
  const optUser = opts?.find(o => o.name === "user");

  const ach = await getAchievementById(data.guild_id, optAch?.value);
  if (!ach) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.channel_message_with_source,
      data: {
        content: stringReplacer(messageList.achievements.not_found, {
          id: optAch?.value
        })
      }
    });

    return;
  }

  const userAch = await getUserAchievement(data.guild_id, optUser?.value, ach);
  if (userAch) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.channel_message_with_source,
      data: {
        content: stringReplacer(messageList.achievements.already_got, {
          user: `<@${optUser?.value}>`,
          id: optAch?.value
        }),
        allowed_mentions: no_mentions
      }
    });

    return;
  }

  await createUserAchievement(data.guild_id, optUser?.value, ach);

  const achievements = await getAllUserAchievements(
    data.guild_id,
    optUser?.value
  );
  const serverRanks = await getServerRanks(data.guild_id);

  const totalPoints = getTotalPoints(achievements);
  const ranks = getCurrentAndNextRank(totalPoints, serverRanks);

  await createInteractionResponse(data.id, data.token, {
    type: interaction_response_type.channel_message_with_source,
    data: {
      content: stringReplacer(messageList.achievements.given_success, {
        user: `<@${optUser?.value}>`,
        name: `\`${ach.name}\``
      }),
      embeds: [
        createAchievementGivenEmbed(ach),
        createAchievementRankProgressEmbed(
          optUser?.value,
          totalPoints,
          ranks.current,
          ranks.next
        )
      ]
    }
  });
};

// COMMAND CALLBACK
const commandExecuted = async (data: discord.interaction) => {
  if (data.data && data.data.name === "achievements") {
    const optSelected = data.data.options ? data.data.options[0].name : "list";

    switch (optSelected) {
      case "create": {
        create(data);
        break;
      }
      case "list": {
        list(data);
        break;
      }
      case "rank": {
        rank(data);
        break;
      }
      case "give": {
        give(data);
        break;
      }
      default:
        _logger.error(
          "UNKNOWN COMMAND",
          data.data!.options![0].name,
          data.data!.options![0].options,
          data.data!.options![0].value
        );
    }
  }
};

export const setUp = () => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
