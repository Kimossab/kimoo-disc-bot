import BaseModule from "#/base-module";

import { editOriginalInteractionResponse } from "../discord/rest";
import { checkAdmin, chunkArray, stringReplacer } from "../helper/common";
import { no_mentions } from "../helper/constants";
import { InteractionPagination } from "../helper/interaction-pagination";
import messageList from "../helper/messages";
import { getOption, getOptions, getOptionValue } from "../helper/modules";
import { addPagination, getApplication } from "../state/store";
import { CommandInteractionDataOption, Interaction } from "../types/discord";
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
} from "./database";
import {
  createAchievementGivenEmbed,
  createAchievementRankProgressEmbed,
  getCurrentAndNextRank,
  getTotalPoints,
} from "./helper";
import { IAchievement } from "./models/achievement.model";
import { IAchievementRank } from "./models/achievement-rank.model";
import { IUserAchievement } from "./models/user-achievement.model";
import {
  updateServerAchievementRanksPage,
  updateServerAchievementsPage,
  updateServerLeaderboardPage,
  updateUserAchievementsPage,
} from "./pagination";

interface CreateCommandOptions {
  name: Nullable<string>;
  image: Nullable<string>;
  description: Nullable<string>;
  points: Nullable<number>;
}

interface EditCommandOptions {
  id: Nullable<number>;
  name: Nullable<string>;
  description: Nullable<string>;
  points: Nullable<number>;
  image: Nullable<string>;
}

interface GiveCommandOptions {
  user: Nullable<string>;
  achievement: Nullable<number>;
}

export default class AchievementModule extends BaseModule {
  constructor(isActive: boolean) {
    super("achievements", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.commandList = {
      create: {
        handler: this.handleCreateCommand,
        isAdmin: true,
      },
      edit: {
        handler: this.handleEditCommand,
        isAdmin: true,
      },
      delete: {
        handler: this.handleDeleteCommand,
        isAdmin: true,
      },
      list: {
        handler: this.handleListCommand,
      },
      rank: {
        handler: this.handleRankCommand,
      },
      give: {
        handler: this.handleGiveCommand,
        isAdmin: true,
      },
    };
  }

  private handleCreateCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const { name, image, description, points } =
        getOptions<CreateCommandOptions>(
          ["name", "image", "description", "points"],
          option.options
        );

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

      await createAchievement(data.guild_id, name, image, description, points);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.create_success, {
          name,
        }),
      });

      this.logger.log(
        `Create achievement ${name} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleEditCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const { id, name, description, points, image } =
        getOptions<EditCommandOptions>(
          ["id", "name", "description", "points", "image"],
          option.options
        );

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

      this.logger.log(
        `Updated achievement ${achievement.id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`,
        achievement
      );
    }
  };

  private handleDeleteCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const id = getOptionValue<number>(option.options, "id");

      if (!id) {
        return;
      }

      await deleteAchievement(data.guild_id, id);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.update_success, {
          id,
        }),
      });

      this.logger.log(
        `Deleted achievement ${id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleListCommand = (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const server = getOption(option.options, "server");
    const user = getOption(option.options, "user");

    if (server) {
      return this.handleListServerCommand(data);
    }

    return this.handleListUserCommand(data, user);
  };

  private handleRankCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const subCommands: Record<string, CommandHandler> = {
      list: this.handleRankListCommand,
      user: this.handleRankUserCommand,
      leaderboard: this.handleRankLeaderboardCommand,
      create: this.handleRankCreateCommand,
      delete: this.handleRankDeleteCommand,
    };

    for (const cmd of Object.keys(subCommands)) {
      const cmdData = getOption(option.options, cmd);

      if (cmdData) {
        return await subCommands[cmd](data, cmdData);
      }
    }
  };

  private handleGiveCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
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

  //sub commands
  private handleListServerCommand = async (
    data: Interaction
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const serverAchievements = await getServerAchievements(data.guild_id);

      if (serverAchievements.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.achievements.server_no_achievements,
        });

        return;
      }
      const chunks = chunkArray<IAchievement>(serverAchievements, 10);

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateServerAchievementsPage
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);

      this.logger.log(
        `List server achievements in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleListUserCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption | null
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      const user = option
        ? getOptionValue<string>(option.options, "user")
        : null;
      const userId = user || data.member.user?.id || "unknown-id";

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

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateUserAchievementsPage
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);

      this.logger.log(
        `List user ${userId} achievements in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleRankListCommand = async (data: Interaction): Promise<void> => {
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

      this.logger.log(
        `List achievement ranks in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleRankUserCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
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

  private handleRankLeaderboardCommand = async (
    data: Interaction
  ): Promise<void> => {
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

      this.logger.log(
        `Get server rank leaderboard in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleRankCreateCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      if (!checkAdmin(data.guild_id, data.member)) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.common.no_permission,
        });
        return;
      }

      const name = getOptionValue<string>(option.options, "name");
      const points = getOptionValue<number>(option.options, "points");

      if (name === null || points === null) {
        return;
      }

      const rankByName = await getRankByName(data.guild_id, name);
      const rankByPoint = await getRankByPoints(data.guild_id, points);

      if (rankByName) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.achievements.rank_exists, {
            name,
          }),
        });
        return;
      }

      if (rankByPoint) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: stringReplacer(messageList.achievements.rank_point_exists, {
            points,
            name: rankByPoint.name,
          }),
        });
        return;
      }

      await createRank(data.guild_id, name, points);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: stringReplacer(messageList.achievements.rank_create_success, {
          points,
          name,
        }),
      });

      this.logger.log(
        `Create achievement rank ${name} with ${points} points in ${data.guild_id} by ${data.member?.user?.username}#${data.member?.user?.discriminator}`
      );
    }
  };

  private handleRankDeleteCommand = async (
    data: Interaction,
    option: CommandInteractionDataOption
  ): Promise<void> => {
    const app = getApplication();
    if (app && app.id && data.guild_id && data.member) {
      if (!checkAdmin(data.guild_id, data.member)) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.common.no_permission,
        });
        return;
      }

      const name = getOptionValue<string>(option.options, "name");

      if (!name) {
        return;
      }

      await deleteRank(data.guild_id, name);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.achievements.rank_deleted,
      });

      this.logger.log(
        `Delete rank ${name} in ${data.guild_id} by ${data.member?.user?.username}#${data.member?.user?.discriminator}`
      );
    }
  };
}
