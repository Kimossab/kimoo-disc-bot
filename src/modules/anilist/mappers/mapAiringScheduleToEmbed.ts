import { APIEmbed, APIEmbedField } from "discord-api-types/v10";
import { NextAiringWithTitle } from "../types/graphql";

export const mapAiringScheduleToEmbed = (data: NextAiringWithTitle): APIEmbed => {
  const fields: APIEmbedField[] = [];
  fields.push({
    name: "Names",
    value: `• ${data.title.english}\n• ${data.title.romaji}\n• ${data.title.native}`,
    inline: false,
  });
  if (data.airingSchedule) {
    fields.push({
      name: "Next Episodes",
      value:
        data.airingSchedule.nodes
          ?.map(s => `#${s.episode} - <t:${s.airingAt}:R>\n`)
          .join("") || "No info yet",
      inline: false,
    });
  }

  const embed: APIEmbed = {
    title: (data.isAdult
      ? "[**NSFW**] "
      : "") + "Airing Schedule",
    url: data.siteUrl,
    color: parseInt(data.coverImage.color?.slice(1) || "FFFFFF", 16),
    fields,
    author: {
      name: "Anilist",
      icon_url: "https://avatars.githubusercontent.com/u/18018524?s=200&v=4",
      url: "https://anilist.co/home",
    },
  };

  if (!data.isAdult) {
    embed.image = { url: data.coverImage.extraLarge };
  }

  return embed;
};
