import { stringReplacer } from "../../helper/common";
import messageList from "../../helper/messages";
import { MediaSubbedInfo } from "../types/graphql";

export const mapSubListToEmbed = (
  data: MediaSubbedInfo[],
  page: number,
  total: number
): discord.embed => {
  const embed: discord.embed = {
    title: "Sub list",
    description: data
      .map(
        (m) =>
          `• [${
            m.title.english ||
            m.title.romaji ||
            m.title.native
          }](${m.siteUrl})\n`
      )
      .join(""),
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
