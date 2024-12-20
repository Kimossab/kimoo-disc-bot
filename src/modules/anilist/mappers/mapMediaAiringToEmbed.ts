import { APIEmbed, APIEmbedField } from "discord-api-types/v10";
import { MediaForAiring } from "../types/graphql";
import { getLastAndNextEpisode } from "#anilist/helpers/anime-manager";

export const mapMediaAiringToEmbed = (data: MediaForAiring): APIEmbed => {
  const fields: APIEmbedField[] = [];
  fields.push({
    name: "Names",
    value: `• ${data.title.english}\n• ${data.title.romaji}\n• ${data.title.native}`,
    inline: false,
  });

  const { next } = getLastAndNextEpisode(data.airingSchedule);
  if (next) {
    fields.push({
      name: "Next episode",
      value: `#${next.episode} - <t:${next.airingAt}:R>`,
      inline: false,
    });
  }

  const embed: APIEmbed = {
    title:
      (data.isAdult
        ? "[**NSFW**] "
        : "") + "Subscription added successfully",
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
