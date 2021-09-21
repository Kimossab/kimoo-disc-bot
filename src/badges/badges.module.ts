import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from '../discord/rest';
import {
  checkAdmin,
  chunkArray,
  deleteFile,
  moveFile,
  stringReplacer,
} from '../helper/common';
import { interaction_response_type } from '../helper/constants';
import { getOption, getOptionValue } from '../helper/modules.helper';
import {
  addPagination,
  getApplication,
  getChannelLastAttachment,
  setCommandExecutedCallback,
} from '../state/actions';
import messageList from '../helper/messages';
import { checkBadgeUser, checkName, createBadge, deleteBadge, getAllBadges, getAllUserBadges, getByName, giveBadge } from './badges.controller';
import { downloadImage } from '../helper/images';
import Logger from '../helper/logger';
import { getAverageColor } from 'fast-average-color-node';
import { IBadge } from './models/badges.model';
import { createGrid } from './list.helper';
import Pagination from '../helper/pagination';

interface IFastAverageColorResult {
  rgb: string;
  rgba: string;
  hex: string;
  hexa: string;
  isDark: boolean;
  isLight: boolean;
  value: number[];
  error: Error;
}

const _logger = new Logger('badges');
let firstSetup = true;

const createdBadgeEmbed = (
  name: string,
  image: string,
  color: IFastAverageColorResult
): discord.embed => {
  const embed: discord.embed = {
    title: 'Badge created successfully',
    description: name,
    color: parseInt(color.hex.substr(1), 16),
    image: {
      url: `attachment://${image}`,
    },
  };

  return embed;
};

const giveBadgeEmbed = (
  name: string,
  image: string,
  user: string,
  color: IFastAverageColorResult
): discord.embed => {
  const embed: discord.embed = {
    title: 'Badge given successfully',
    description: `Badge \`${name}\` given to <@${user}> successfully.`,
    color: parseInt(color.hex.substr(1), 16),
    image: {
      url: `attachment://${image}`,
    },
  };

  return embed;
};

const createBadgeListEmbed = async (fileName: string, page: number, total: number): Promise<discord.embed> => {
  const embed: discord.embed = {
    title: 'Server Badges',
    color: 3035554,
    image: {
      url: `attachment://${fileName}`,
    },
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total }),
    };
  }

  return embed;
};

const userBadgeListEmbed = async (user: string | undefined, fileName: string, page: number, total: number): Promise<discord.embed> => {
  const embed: discord.embed = {
    title: 'User Badges',
    description: `<@${user}>`,
    color: 3035554,
    image: {
      url: `attachment://${fileName}`,
    },
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, { page, total }),
    };
  }

  return embed;
};

const updateListBadgesPage = async (
  badges: IBadge[],
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const fileName = await createGrid(badges);
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [await createBadgeListEmbed(fileName, page, total)],
      attachments: []
    },
      `trash/${fileName}`);
    await deleteFile(`trash/${fileName}`);
  }
};

const updateUserListBadgesPage = async (
  badges: IBadge[],
  page: number,
  total: number,
  token: string,
  userInfo?: Nullable<discord.guild_member>
): Promise<void> => {
  const app = getApplication();
  if (app) {
    const fileName = await createGrid(badges);
    await editOriginalInteractionResponse(app.id, token, {
      content: '',
      embeds: [await userBadgeListEmbed(userInfo!.user?.id, fileName, page, total)],
      attachments: []
    },
      `trash/${fileName}`);
    await deleteFile(`trash/${fileName}`);
  }
};

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

    const lastAttachment = getChannelLastAttachment(data.channel_id);
    const image = getOptionValue<string>(option.options, 'image');
    const name = getOptionValue<string>(option.options, 'name');

    const url = image ?? lastAttachment;

    if (!url) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.no_image,
      });
      return;
    }

    if (!name || (await checkName(name, data.guild_id))) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: 'Badge with that name already exists.',
      });
      return;
    }

    const imagePath = await downloadImage(url, `trash/${name}`);

    if (!imagePath.success) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: 'URL not image or image too big (max 20MB)',
      });
      return;
    }

    const badge = await createBadge(
      name || '' + new Date(),
      data.guild_id,
      imagePath.extension
    );

    if (!badge) {
      await deleteFile(`trash/${name}`);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: `Something went wrong`,
      });
      return;
    }

    await moveFile(
      `trash/${name}`,
      `badges/${badge._id}${imagePath.extension}`
    );

    await editOriginalInteractionResponse(
      app.id,
      data.token,
      {
        content: ``,
        embeds: [
          createdBadgeEmbed(
            name,
            `${badge._id}${imagePath.extension}`,
            await getAverageColor(`badges/${badge._id}${imagePath.extension}`)
          ),
        ],
      },
      `badges/${badge._id}${imagePath.extension}`
    );

    _logger.log(
      `Create badge in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleListCommand = async (
  data: discord.interaction
): Promise<void> => {
  const app = getApplication();

  if (app) {
    const badges = await getAllBadges(data.guild_id);

    const chunks = chunkArray<IBadge>(badges, 9);

    const fileName = await createGrid(chunks[0]);

    const embed = await createBadgeListEmbed(fileName, 1, chunks.length);
    const message = await editOriginalInteractionResponse(app.id, data.token, {
      content: '',
      embeds: [embed],
      attachments: []
    },
      `trash/${fileName}`);

    if (message && chunks.length > 1) {
      const pagination = new Pagination<IBadge[]>(
        data.channel_id,
        message.id,
        chunks,
        updateListBadgesPage,
        data.token,
        data.member
      );

      addPagination(pagination);
    }

    await deleteFile(`trash/${fileName}`);

    _logger.log(
      `List badges in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
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
    const name = getOptionValue<string>(option.options, 'name');

    if (!user || !name) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.badges.not_found,
      });
      return;
    }

    const badge = await getByName(name, data.guild_id);

    if (!badge) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.badges.not_found,
      });
      return;
    }

    const userHasBadge = await checkBadgeUser(badge, user, data.guild_id);

    if (userHasBadge) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: "User already has this badge.",
      });
      return;
    }

    const userBadge = await giveBadge(badge, user, data.guild_id);

    if (!userBadge) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.internal_error,
      });
      return;
    }

    await editOriginalInteractionResponse(
      app.id,
      data.token,
      {
        content: ``,
        embeds: [
          giveBadgeEmbed(
            badge.name,
            `${badge._id}${badge.fileExtension}`,
            user,
            await getAverageColor(`badges/${badge._id}${badge.fileExtension}`)
          ),
        ],
      },
      `badges/${badge._id}${badge.fileExtension}`
    );

    _logger.log(
      `Given badge ${name} to ${user} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const handleUserCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();

  if (app) {
    const user = getOptionValue<string>(option.options, 'user');
    const userId = user || data.member.user?.id || '';

    const allUserBadges = await getAllUserBadges(userId, data.guild_id);

    if (allUserBadges.length === 0 || allUserBadges[0].badges.length === 0) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: `No badges found`,
      });
      return;
    }

    const chunks = chunkArray<IBadge>(allUserBadges[0].badges, 9);

    const fileName = await createGrid(chunks[0]);

    const embed = await userBadgeListEmbed(userId, fileName, 1, chunks.length);
    const message = await editOriginalInteractionResponse(app.id, data.token, {
      content: '',
      embeds: [embed],
      attachments: []
    },
      `trash/${fileName}`);

    if (message && chunks.length > 1) {
      const pagination = new Pagination<IBadge[]>(
        data.channel_id,
        message.id,
        chunks,
        updateUserListBadgesPage,
        data.token
      );

      addPagination(pagination);
    }

    await deleteFile(`trash/${fileName}`);

    _logger.log(
      `List badges for user ${userId} by ${data.member.user?.id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
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

    const name = getOptionValue<string>(option.options, 'name');

    if (!name) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: `No badges found`,
      });
      return;
    }

    const badge = await deleteBadge(name, data.guild_id);

    if (!badge) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: `No badges found`,
      });
      return;
    }

    await deleteFile(`badges/${badge.name}.${badge.fileExtension}`);

    await editOriginalInteractionResponse(app.id, data.token, {
      content: `Badge ${name} deleted`,
    });

    _logger.log(
      `Delete badge ${name} by ${data.member.user?.id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

// COMMAND CALLBACK
const commandExecuted = async (data: discord.interaction): Promise<void> => {
  const app = getApplication();

  if (app) {
    if (data.data && data.data.name === 'badges') {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.acknowledge_with_source,
      });

      const create = getOption(data.data.options, 'create');
      const list = getOption(data.data.options, 'list');
      const give = getOption(data.data.options, 'give');
      const user = getOption(data.data.options, 'user');
      const remove = getOption(data.data.options, 'remove');
      const deleteBadge = getOption(data.data.options, 'delete');
      const edit = getOption(data.data.options, 'edit');

      if (create) {
        handleCreateCommand(data, create);
      }

      if (list) {
        handleListCommand(data);
      }

      if (give) {
        handleGiveCommand(data, give);
      }

      if (user) {
        handleUserCommand(data, user);
      }

      if (deleteBadge) {
        handleDeleteCommand(data, deleteBadge);
      }
    }
  }
};

export const setUp = () => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
