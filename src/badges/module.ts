import { getAverageColor } from "fast-average-color-node";
import { editOriginalInteractionResponse } from "../discord/rest";
import {
  chunkArray,
  deleteFile,
  moveFile,
} from "../helper/common";
import {
  addPagination,
  getApplication,
  getChannelLastAttachment,
} from "../state/actions";
import messageList from "../helper/messages";
import {
  checkBadgeUser,
  checkName,
  createBadge,
  deleteBadge,
  getAllBadges,
  getAllUserBadges,
  getByName,
  giveBadge,
} from "./database";
import { downloadImage } from "../helper/images";
import { IBadge } from "./models/badges.model";
import {
  createdBadgeEmbed,
  giveBadgeEmbed,
  updateListBadgesPage,
  updateUserListBadgesPage,
} from "./helper";
import BaseModule from "../base-module";
import { InteractionPagination } from "../helper/interaction-pagination";

interface NameOption {
  name: string;
}
interface ImageOption {
  image: string;
}
interface UserOption {
  user: string;
}

type CreateCommandOptions = NameOption & ImageOption;
type GiveCommandOptions = NameOption & UserOption;

export default class BadgesModule extends BaseModule {
  constructor() {
    super("badges");

    this.commandList = {
      create: {
        handler: this.handleCreateCommand,
        isAdmin: true,
      },
      list: {
        handler: this.handleListCommand,
      },
      give: {
        handler: this.handleGiveCommand,
        isAdmin: true,
      },
      user: {
        handler: this.handleUserCommand,
      },
      // remove: {
      //   handler: this.handleGiveCommand,
      //   isAdmin: true,
      // },
      delete: {
        handler: this.handleDeleteCommand,
        isAdmin: true,
      },
      // edit: {
      //   handler: this.handleGiveCommand,
      //   isAdmin: true,
      // },
    };
  }

  private handleCreateCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { name, image } =
        this.getOptions<CreateCommandOptions>(
          ["name", "image"],
          option.options
        );
      const lastAttachment = getChannelLastAttachment(
        data.channel_id
      );
      const url = image ?? lastAttachment;

      if (!url) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.common.no_image,
          }
        );
        return;
      }

      if (!name || (await checkName(name, data.guild_id))) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "Badge with that name already exists.",
          }
        );
        return;
      }

      const imagePath = await downloadImage(
        url,
        `trash/${name}`
      );

      if (!imagePath.success) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content:
              "URL is not an image or image is too big (max 20MB)",
          }
        );
        return;
      }

      const badge = await createBadge(
        name || `${new Date()}`,
        data.guild_id,
        imagePath.extension
      );

      if (!badge) {
        await deleteFile(`trash/${name}`);

        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "Something went wrong",
          }
        );
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
          content: "",
          embeds: [
            createdBadgeEmbed(
              name,
              `${badge._id}${imagePath.extension}`,
              await getAverageColor(
                `badges/${badge._id}${imagePath.extension}`
              )
            ),
          ],
        },
        `badges/${badge._id}${imagePath.extension}`
      );

      this.logger.log(
        `Create badge in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleListCommand: CommandHandler = async (
    data
  ) => {
    const app = getApplication();

    if (app && app.id) {
      const badges = await getAllBadges(data.guild_id);

      const chunks = chunkArray<IBadge>(badges, 9);

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateListBadgesPage
      );

      await pagination.create(data.token);
      addPagination(pagination);

      this.logger.log(
        `List badges in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleGiveCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { user, name } =
        this.getOptions<GiveCommandOptions>(
          ["user", "name"],
          option.options
        );
      if (!user || !name) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.badges.not_found,
          }
        );
        return;
      }

      const badge = await getByName(name, data.guild_id);

      if (!badge) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.badges.not_found,
          }
        );
        return;
      }

      const userHasBadge = await checkBadgeUser(
        badge,
        user,
        data.guild_id
      );

      if (userHasBadge) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "User already has this badge.",
          }
        );
        return;
      }

      const userBadge = await giveBadge(
        badge,
        user,
        data.guild_id
      );

      if (!userBadge) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.common.internal_error,
          }
        );
        return;
      }

      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          embeds: [
            giveBadgeEmbed(
              badge.name,
              `${badge._id}${badge.fileExtension}`,
              user,
              await getAverageColor(
                `badges/${badge._id}${badge.fileExtension}`
              )
            ),
          ],
        },
        `badges/${badge._id}${badge.fileExtension}`
      );

      this.logger.log(
        `Given badge ${name} to ${user} in ` +
          `${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleUserCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { user } = this.getOptions<UserOption>(
        ["user"],
        option.options
      );
      const userId = user || data.member.user?.id || "";

      const allUserBadges = await getAllUserBadges(
        userId,
        data.guild_id
      );

      if (
        allUserBadges.length === 0 ||
        allUserBadges[0].badges.length === 0
      ) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "No badges found",
          }
        );
        return;
      }

      const chunks = chunkArray<IBadge>(
        allUserBadges[0].badges,
        9
      );

      const pagination = new InteractionPagination(
        app.id,
        chunks,
        updateUserListBadgesPage,
        userId
      );

      await pagination.create(data.token);
      addPagination(pagination);

      this.logger.log(
        `List badges for user ${userId} by ${data.member.user?.id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private handleDeleteCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { name } = this.getOptions<NameOption>(
        ["name"],
        option.options
      );
      if (!name) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.badges.not_found,
          }
        );
        return;
      }

      const badge = await deleteBadge(name, data.guild_id);

      if (!badge) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.badges.not_found,
          }
        );
        return;
      }

      await deleteFile(
        `badges/${badge.name}.${badge.fileExtension}`
      );

      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: `Badge ${name} deleted`,
        }
      );

      this.logger.log(
        `Delete badge ${name} by ${data.member.user?.id} in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };
}
