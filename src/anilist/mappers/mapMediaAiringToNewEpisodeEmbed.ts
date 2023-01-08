import { Embed, EmbedField } from "../../types/discord";
import { MediaForAiring } from "../types/graphql";

export const mapMediaAiringToNewEpisodeEmbed = (
  data: MediaForAiring,
  episode: number,
  airingAt: number
): Embed => {
  const fields: EmbedField[] = [];
  fields.push({
    name: "Names",
    value: `• ${data.title.english}\n• ${data.title.romaji}\n• ${data.title.native}`,
    inline: false,
  });
  if (data.nextAiringEpisode) {
    fields.push({
      name: "Next episode",
      value: `#${data.nextAiringEpisode.episode} - <t:${data.nextAiringEpisode.airingAt}:R>`,
      inline: false,
    });
  }

  const embed: Embed = {
    title:
      (data.isAdult ? "[**NSFW**] " : "") +
      (data.title.english ||
        data.title.romaji ||
        data.title.native) +
      `#${episode}`,
    description: `New episode just aired <t:${airingAt}:R>`,
    url: data.siteUrl,
    color: parseInt(
      data.coverImage.color?.slice(1) || "FFFFFF",
      16
    ),
    fields,
    author: {
      name: "Anilist",
      icon_url:
        "https://avatars.githubusercontent.com/u/18018524?s=200&v=4",
      url: "https://anilist.co/home",
    },
  };

  if (!data.isAdult) {
    embed.image = { url: data.coverImage.extraLarge };
  }

  return embed;
};
