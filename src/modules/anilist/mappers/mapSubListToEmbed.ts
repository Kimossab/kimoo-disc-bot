import { interpolator } from "@/helper/common";
import messageList from "@/helper/messages";
import { MediaSubbedInfo } from "../types/graphql";
import { RichEmbed } from "@/discord/rest/types.gen";

export const mapSubListToEmbed = (
  data: MediaSubbedInfo[],
  page: number,
  total: number
): RichEmbed => {
  const embed: RichEmbed = {
    title: "Sub list",
    description: data
      .map((m) => `• [${m.title.english || m.title.romaji || m.title.native}](${
        m.siteUrl
      }) | ${
        m.nextAiringEpisode
          ? `Ep. #${m.nextAiringEpisode.episode} <t:${m.nextAiringEpisode.airingAt}:R>`
          : "Next episode unknown"
      }\n`)
      .join("")
  };

  if (total > 1) {
    embed.footer = {
      text: interpolator(messageList.common.page, {
        page,
        total
      })
    };
  }

  return embed;
};
