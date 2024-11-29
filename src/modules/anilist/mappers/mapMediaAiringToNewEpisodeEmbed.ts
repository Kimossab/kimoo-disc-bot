
import { RichEmbed, RichEmbedField } from "@/discord/rest/types.gen";
import { InfoWithSchedule, NextEpisode } from "../types/graphql";

export const mapMediaAiringToNewEpisodeEmbed = (
  data: InfoWithSchedule,
  { episode, airingAt }: NextEpisode,
  nextEpisodeInfo: NextEpisode | null
): RichEmbed => {
  const fields: RichEmbedField[] = [];
  fields.push({
    name: "Names",
    value: `• ${data.title.english}\n• ${data.title.romaji}\n• ${data.title.native}`,
    inline: false
  });
  if (nextEpisodeInfo) {
    fields.push({
      name: "Next episode",
      value: `#${nextEpisodeInfo.episode} - <t:${nextEpisodeInfo.airingAt}:R>`,
      inline: false
    });
  }

  const embed: RichEmbed = {
    title:
      (data.isAdult
        ? "[**NSFW**] "
        : "") +
        (data.title.english || data.title.romaji || data.title.native) +
        `#${episode}`,
    description: `New episode just aired <t:${airingAt}:R>`,
    url: data.siteUrl,
    color: parseInt(data.coverImage.color?.slice(1) || "FFFFFF", 16),
    fields,
    author: {
      name: "Anilist",
      icon_url: "https://avatars.githubusercontent.com/u/18018524?s=200&v=4",
      url: "https://anilist.co/home"
    }
  };

  if (!data.isAdult) {
    embed.image = { url: data.coverImage.extraLarge };
  }

  return embed;
};
