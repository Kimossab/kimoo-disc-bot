import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from '../discord/rest';
import { checkAdmin, chunkArray, stringReplacer } from '../helper/common';
import { interaction_response_type, no_mentions } from '../helper/constants';
import Logger from '../helper/logger';
import {
  addPagination,
  getApplication,
  setCommandExecutedCallback,
} from '../state/actions';
import messageList from '../helper/messages';
import {
  createAchievement,
  createRank,
  createUserAchievement,
  deleteAchievement,
  deleteRank,
  getAchievement,
  getAchievementById,
  getAllUserAchievements,
  getRankByName,
  getRankByPoints,
  getServerAchievementLeaderboard,
  getServerAchievements,
  getServerRanks,
  getUserAchievement,
  updateAchievement,
} from './achievement.controller';
import { IAchievement } from './models/achievement.model';
import Pagination from '../helper/pagination';
import { IAchievementRank } from './models/achievement-rank.model';
import { IUserAchievement } from './models/user-achievement.model';
import { getOption, getOptionValue } from '../helper/modules.helper';

const _logger = new Logger('birthday');

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
    next,
  };
};

const createProgressBar = (
  value: number,
  max: number,
  steps: number
): string => {
  const prog = Math.round((value * steps) / max);

  let bar =
    '```⠀\n' +
    '▓'.repeat(prog) +
    '░'.repeat(steps - prog) +
    `\n${Math.round((prog * 100) / steps)}%\`\`\``;

  return bar;
};

const createAchievementGivenEmbed = (
  achievement: IAchievement
): discord.embed => {
  const descMessage = stringReplacer(
    messageList.achievements.new_achievement_awarded_desc,
    {
      name: achievement.name,
      description: achievement.description,
      points: achievement.points,
    }
  );

  const embed: discord.embed = {
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
    : '';

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
    title: messageList.achievements.progress,
    description,
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
    title: messageList.achievements.user_achievements,
    color: 3035554,
    description: `<@${data[0].user}>\n`,
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total }),
    };
  }

  for (const ach of data) {
    embed.description += `${ach.achievement.id} - `;
    if (ach.achievement.image) {
      embed.description += `[${ach.achievement.name}](${ach.achievement.image})`;
    } else {
      embed.description += ach.achievement.name;
    }

    embed.description +=
      ' - ' +
      '★'.repeat(ach.achievement.points) +
      ` - ${ach.awardDate.toLocaleDateString()}\n`;
  }

  return embed;
};

const updateUserAchievementsPage = async (
  data: IUserAchievement[],
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: messageList.achievements.server_no_achievements,
      embeds: [createUserAchievementsEmbed(data, page, total)],
    });
  }
};

const createServerAchievementsEmbed = (
  data: IAchievement[],
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: messageList.achievements.server_achievements,
    color: 3035554,
    description: '',
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total }),
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
    embed.description += ' - ' + '★'.repeat(ach.points) + '\n';
  }

  return embed;
};

const updateServerAchievementsPage = async (
  data: IAchievement[],
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [createServerAchievementsEmbed(data, page, total)],
    });
  }
};

const createServerAchievementRanksEmbed = (
  data: IAchievementRank[],
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: messageList.achievements.server_achievement_ranks,
    color: 3035554,
    description: '',
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total }),
    };
  }

  for (const rank of data) {
    embed.description += `${rank.name} - ★X${rank.points}\n`;
  }

  return embed;
};

const updateServerAchievementRanksPage = async (
  data: IAchievementRank[],
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [createServerAchievementRanksEmbed(data, page, total)],
    });
  }
};
const createServerLeaderboardEmbed = (
  data: achievement.server_leaderboard[],
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: messageList.achievements.server_leaderboard,
    color: 3035554,
    fields: [
      {
        name: '• Positions',
        value: '',
      },
    ],
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total }),
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
  data: achievement.server_leaderboard[],
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [createServerLeaderboardEmbed(data, page, total)],
    });
  }
};

//SUB-COMMANDS
const handleListServerCommand = async (
  data: discord.interaction
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const serverAchievements = await getServerAchievements(data.guild_id);

    if (serverAchievements.length === 0) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.achievements.server_no_achievements,
      });

      return;
    }
    const chunks = chunkArray<IAchievement>(serverAchievements, 10);
    const embed = createServerAchievementsEmbed(chunks[0], 1, chunks.length);
    const message = await editOriginalInteractionResponse(app.id, data.token, {
      content: '',
      embeds: [embed],
    });
    if (message && chunks.length > 1) {
      const pagination = new Pagination<IAchievement[]>(
        data.channel_id,
        message.id,
        chunks,
        updateServerAchievementsPage,
        data.token
      );

      addPagination(pagination);
    }

    _logger.log(
      `List server achievements in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleListUserCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option | null
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const user = option ? getOptionValue<string>(option.options, 'user') : null;
    const userId = user || data.member.user!.id;

    const userAchievements = await getAllUserAchievements(
      data.guild_id,
      userId
    );

    if (userAchievements.length === 0) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.achievements.user_no_achievements,
      });

      return;
    }

    const chunks = chunkArray<IUserAchievement>(userAchievements, 10);

    const embed = createUserAchievementsEmbed(chunks[0], 1, chunks.length);
    const message = await editOriginalInteractionResponse(app.id, data.token, {
      content: '',
      embeds: [embed],
    });
    if (message && chunks.length > 1) {
      const pagination = new Pagination<IUserAchievement[]>(
        data.channel_id,
        message.id,
        chunks,
        updateUserAchievementsPage,
        data.token
      );

      addPagination(pagination);
    }

    _logger.log(
      `List user ${userId} achievements in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleRankListCommand = async (
  data: discord.interaction
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const ranks = await getServerRanks(data.guild_id);

    const chunks = chunkArray<IAchievementRank>(ranks, 10);

    const embed = createServerAchievementRanksEmbed(
      chunks[0],
      1,
      chunks.length
    );
    const message = await editOriginalInteractionResponse(app.id, data.token, {
      content: '',
      embeds: [embed],
    });
    if (message && chunks.length > 1) {
      const pagination = new Pagination<IAchievementRank[]>(
        data.channel_id,
        message.id,
        chunks,
        updateServerAchievementRanksPage,
        data.token
      );

      addPagination(pagination);
    }

    _logger.log(
      `List achievement ranks in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleRankUserCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const optUser = getOptionValue<string>(option.options, 'user');

    const user = optUser || data.member.user!.id;

    const achievements = await getAllUserAchievements(data.guild_id, user);
    const serverRanks = await getServerRanks(data.guild_id);

    const totalPoints = getTotalPoints(achievements);
    const ranks = getCurrentAndNextRank(totalPoints, serverRanks);

    await editOriginalInteractionResponse(app.id, data.token, {
      content: '',
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

const handleRankLeaderboardCommand = async (
  data: discord.interaction
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const allAch = await getServerAchievementLeaderboard(data.guild_id);

    const chunks = chunkArray<achievement.server_leaderboard>(allAch, 10);

    const embed = createServerLeaderboardEmbed(chunks[0], 1, chunks.length);
    const message = await editOriginalInteractionResponse(app.id, data.token, {
      content: '',
      embeds: [embed],
    });
    if (message && chunks.length > 1) {
      const pagination = new Pagination<achievement.server_leaderboard[]>(
        data.channel_id,
        message.id,
        chunks,
        updateServerLeaderboardPage,
        data.token
      );

      addPagination(pagination);
    }

    _logger.log(
      `Get server rank leaderboard in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleRankCreateCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const name = getOptionValue<string>(option.options, 'name');
    const points = getOptionValue<number>(option.options, 'points');

    if (name === null || points === null) {
      return;
    }

    const rankByName = await getRankByName(data.guild_id, name);
    const rankByPoint = await getRankByPoints(data.guild_id, points);

    if (rankByName) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.rank_exists, {
          name: name,
        }),
      });
      return;
    }

    if (rankByPoint) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.rank_point_exists, {
          points: points,
          name: rankByPoint.name,
        }),
      });
      return;
    }

    await createRank(data.guild_id, name, points);

    await editOriginalInteractionResponse(app.id, data.token, {
      content: stringReplacer(messageList.achievements.rank_create_success, {
        points: points,
        name: name,
      }),
    });

    _logger.log(
      `Create achievement rank ${name} with ${points} points in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleRankDeleteCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (!checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    const name = getOptionValue<string>(option.options, 'name');

    if (!name) {
      return;
    }

    await deleteRank(data.guild_id, name);

    await editOriginalInteractionResponse(app.id, data.token, {
      content: messageList.achievements.rank_deleted,
    });

    _logger.log(
      `Delete rank ${name} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

// COMMANDS
const handleCreateCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (!checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    const name = getOptionValue<string>(option.options, 'name');
    const image = getOptionValue<string>(option.options, 'image');
    const description = getOptionValue<string>(option.options, 'description');
    const points = getOptionValue<number>(option.options, 'points');

    if (!name) {
      return;
    }

    const achievement = await getAchievement(data.guild_id, name);

    if (achievement) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.achievements.already_exists,
      });
      return;
    }

    await createAchievement(data.guild_id, name!, image, description!, points!);

    await editOriginalInteractionResponse(app.id, data.token, {
      content: stringReplacer(messageList.achievements.create_success, {
        name: name,
      }),
    });

    _logger.log(
      `Create achievement ${name}  in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleEditCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (!checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    const id = getOptionValue<number>(option.options, 'id');
    const name = getOptionValue<string>(option.options, 'name');
    const description = getOptionValue<string>(option.options, 'description');
    const points = getOptionValue<number>(option.options, 'points');
    const image = getOptionValue<string>(option.options, 'image');

    if (!id) {
      return;
    }

    const achievement = await updateAchievement(
      data.guild_id,
      id,
      name,
      image,
      description,
      points
    );

    if (!achievement) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.not_found, {
          id,
        }),
      });
      return;
    }

    await editOriginalInteractionResponse(app.id, data.token, {
      content: stringReplacer(messageList.achievements.update_success, {
        name: achievement.name,
      }),
    });

    _logger.log(
      `Updated achievement ${achievement.id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`,
      achievement
    );
  }
};

const handleDeleteCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (!checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    const id = getOptionValue<number>(option.options, 'id');

    if (!id) {
      return;
    }

    await deleteAchievement(data.guild_id, id);

    await editOriginalInteractionResponse(app.id, data.token, {
      content: stringReplacer(messageList.achievements.update_success, {
        id,
      }),
    });

    _logger.log(
      `Deleted achievement ${id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleListCommand = (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const server = getOption(option.options, 'server');
  const user = getOption(option.options, 'user');

  if (server) {
    return handleListServerCommand(data);
  }

  return handleListUserCommand(data, user);
};

const handleRankCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const list = getOption(option.options, 'list');
  const user = getOption(option.options, 'user');
  const leaderboard = getOption(option.options, 'leaderboard');
  const create = getOption(option.options, 'create');
  const optDelete = getOption(option.options, 'delete');

  if (list) {
    return await handleRankListCommand(data);
  }

  if (user) {
    return await handleRankUserCommand(data, user);
  }

  if (leaderboard) {
    return await handleRankLeaderboardCommand(data);
  }

  if (create) {
    return await handleRankCreateCommand(data, create);
  }

  if (optDelete) {
    return await handleRankDeleteCommand(data, optDelete);
  }
};

const handleGiveCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (!checkAdmin(data.guild_id, data.member)) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_permission,
      });
      return;
    }

    const user = getOptionValue<string>(option.options, 'user');
    const achievement = getOptionValue<number>(option.options, 'achievement');

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

    const userAch = await getUserAchievement(data.guild_id, user, ach);
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

    await createUserAchievement(data.guild_id, user, ach);

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

// COMMAND CALLBACK
const commandExecuted = async (data: discord.interaction): Promise<void> => {
  if (data.data && data.data.name === 'achievements') {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source,
    });

    const create = getOption(data.data.options, 'create');
    const edit = getOption(data.data.options, 'edit');
    const optDelete = getOption(data.data.options, 'delete');

    const list = getOption(data.data.options, 'list');
    const rank = getOption(data.data.options, 'rank');
    const give = getOption(data.data.options, 'give');

    if (create) {
      return await handleCreateCommand(data, create);
    }

    if (edit) {
      return await handleEditCommand(data, edit);
    }

    if (optDelete) {
      return await handleDeleteCommand(data, optDelete);
    }

    if (list) {
      return await handleListCommand(data, list);
    }

    if (rank) {
      return await handleRankCommand(data, rank);
    }

    if (give) {
      return await handleGiveCommand(data, give);
    }

    _logger.error(
      'UNKNOWN COMMAND',
      data.data!.options![0].name,
      data.data!.options![0].options,
      data.data!.options![0].value
    );

    const app = getApplication();
    if (app) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.internal_error,
      });
    }
  }
};

export const setUp = () => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
