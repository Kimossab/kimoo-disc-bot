import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import { editOriginalInteractionResponse } from "../discord/rest";
import {
  stringReplacer,
  deleteFile,
} from "../helper/common";
import { getApplication } from "../state/actions";
import { IBadge } from "./models/badges.model";
import messageList from "../helper/messages";
import { Embed, GuildMember } from "../types/discord";

export interface IFastAverageColorResult {
  rgb: string;
  rgba: string;
  hex: string;
  hexa: string;
  isDark: boolean;
  isLight: boolean;
  value: number[];
  error: Error;
}

const SINGLE_WIDTH = 250;
const SINGLE_HEIGHT = 250;
const MARGIN = 50;
const COLUMNS = 3;
const ROWS = 3;
const TEXT_HEIGHT = 45;
const FULL_WIDTH =
  SINGLE_WIDTH * COLUMNS + MARGIN * (COLUMNS + 1);
const FULL_HEIGHT =
  SINGLE_HEIGHT * ROWS +
  MARGIN * (ROWS + 1) +
  TEXT_HEIGHT * ROWS;

export const createGrid = async (
  badges: IBadge[]
): Promise<string> => {
  const fileName = `${+new Date()}.png`;
  const canvas = createCanvas(FULL_WIDTH, FULL_HEIGHT);
  const context = canvas.getContext("2d");

  context.font = `bold ${TEXT_HEIGHT}px Inconsolata`;
  context.textAlign = "center";
  context.fillStyle = "#fff";

  let x = MARGIN;
  let y = MARGIN;

  for (const badge of badges) {
    const image = await loadImage(
      `badges/${badge._id}${badge.fileExtension}`
    );
    context.drawImage(
      image,
      x,
      y,
      SINGLE_WIDTH,
      SINGLE_HEIGHT
    );

    context.fillText(
      badge.name,
      x + SINGLE_WIDTH / 2,
      y + SINGLE_HEIGHT + TEXT_HEIGHT
    );

    x += MARGIN + SINGLE_WIDTH;

    if (x > FULL_WIDTH - MARGIN) {
      x = MARGIN;
      y += MARGIN + SINGLE_HEIGHT + TEXT_HEIGHT;
    }
  }

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(`trash/${fileName}`, buffer);

  return fileName;
};

export const createdBadgeEmbed = (
  name: string,
  image: string,
  color: IFastAverageColorResult
): Embed => {
  const embed: Embed = {
    title: "Badge created successfully",
    description: name,
    color: parseInt(color.hex.substr(1), 16),
    image: {
      url: `attachment://${image}`,
    },
  };

  return embed;
};

export const giveBadgeEmbed = (
  name: string,
  image: string,
  user: string,
  color: IFastAverageColorResult
): Embed => {
  const embed: Embed = {
    title: "Badge given successfully",
    description: `Badge \`${name}\` given to <@${user}> successfully.`,
    color: parseInt(color.hex.substr(1), 16),
    image: {
      url: `attachment://${image}`,
    },
  };

  return embed;
};

export const createBadgeListEmbed = async (
  fileName: string,
  page: number,
  total: number
): Promise<Embed> => {
  const embed: Embed = {
    title: "Server Badges",
    color: 3035554,
    image: {
      url: `attachment://${fileName}`,
    },
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    };
  }

  return embed;
};

export const userBadgeListEmbed = async (
  user: string | undefined,
  fileName: string,
  page: number,
  total: number
): Promise<Embed> => {
  const embed: Embed = {
    title: "User Badges",
    description: `<@${user}>`,
    color: 3035554,
    image: {
      url: `attachment://${fileName}`,
    },
  };

  if (total > 1) {
    embed.footer = {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    };
  }

  return embed;
};

export const updateListBadgesPage = async (
  badges: IBadge[],
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app && app.id) {
    const fileName = await createGrid(badges);
    await editOriginalInteractionResponse(
      app.id,
      token,
      {
        content: "",
        embeds: [
          await createBadgeListEmbed(fileName, page, total),
        ],
        attachments: [],
      },
      `trash/${fileName}`
    );
    await deleteFile(`trash/${fileName}`);
  }
};

export const updateUserListBadgesPage = async (
  badges: IBadge[],
  page: number,
  total: number,
  token: string,
  userInfo?: Nullable<GuildMember>
): Promise<void> => {
  const app = getApplication();
  if (app && app.id) {
    const fileName = await createGrid(badges);
    await editOriginalInteractionResponse(
      app.id,
      token,
      {
        content: "",
        embeds: [
          await userBadgeListEmbed(
            userInfo!.user?.id,
            fileName,
            page,
            total
          ),
        ],
        attachments: [],
      },
      `trash/${fileName}`
    );
    await deleteFile(`trash/${fileName}`);
  }
};
