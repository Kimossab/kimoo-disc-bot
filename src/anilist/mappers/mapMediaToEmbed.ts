import { stringReplacer } from "../../helper/common";
import {
  PageResponse,
  MediaList,
  Date,
} from "../types/graphql";
import messageList from "../../helper/messages";
import {
  formatMapper,
  relationMapper,
  seasonMapper,
  sourceMapper,
  statusMapper,
  typeMapper,
} from "./enumMapper";

const dateToString = (date: Date): string => {
  return `${date.year}-${date.month}-${date.day}`;
};

const formatReleasingDate = (
  start: Date,
  end: Date
): string | null => {
  if (!start.year) {
    return null;
  }

  if (!end.year) {
    return dateToString(start);
  }

  return `${dateToString(start)} - ${dateToString(end)}`;
};

const cleanUpDescription = (
  description: string
): string => {
  return description
    .replace(/<br>/g, "")
    .replace(/<i>/g, "*")
    .replace(/<\/i>/g, "*");
};

export const mapMediaToEmbed = (
  data: PageResponse<MediaList>
): Embed[] => {
  return data.Page.media.map((media, index) => {
    const fields: Embed_field[] = [];
    fields.push({
      name: "Other names",
      value: `• ${media.title.native}\n• ${media.title.romaji}`,
      inline: true,
    });
    fields.push({
      name: "Type",
      value: typeMapper[media.type],
      inline: true,
    });
    fields.push({
      name: "Format",
      value: formatMapper[media.format],
      inline: true,
    });
    fields.push({
      name: "Status",
      value: statusMapper[media.status],
      inline: true,
    });
    const dates = formatReleasingDate(
      media.startDate,
      media.endDate
    );
    if (dates) {
      fields.push({
        name: "Airing Dates",
        value: dates,
        inline: true,
      });
    }
    if (media.season) {
      fields.push({
        name: "Season",
        value: seasonMapper[media.season],
        inline: true,
      });
    }
    if (media.episodes) {
      fields.push({
        name: "Episodes",
        value: media.episodes.toString(),
        inline: true,
      });
    }
    if (media.duration) {
      fields.push({
        name: "Duration",
        value: media.duration.toString(),
        inline: true,
      });
    }
    if (media.volumes) {
      fields.push({
        name: "Volumes",
        value: media.volumes.toString(),
        inline: true,
      });
    }
    if (media.source) {
      fields.push({
        name: "Source",
        value: sourceMapper[media.source],
        inline: true,
      });
    }
    if (media.averageScore) {
      fields.push({
        name: "Average score",
        value: media.averageScore.toString(),
        inline: true,
      });
    }
    if (media.nextAiringEpisode) {
      fields.push({
        name: "Next episode",
        value: `#${media.nextAiringEpisode.episode} - <t:${media.nextAiringEpisode.airingAt}:R>`,
        inline: true,
      });
    }
    if (media.studios?.nodes?.length) {
      fields.push({
        name: "Studios",
        value: media.studios.nodes
          .map((studio) => `• ${studio.name}`)
          .join("\n"),
        inline: true,
      });
    }
    if (media.genres?.length) {
      fields.push({
        name: "Genres",
        value: media.genres.join(", "),
        inline: false,
      });
    }
    if (media.relations.edges.length) {
      fields.push({
        name: "Related media",
        value: media.relations.edges
          .map(
            (relation) =>
              `• ${
                relationMapper[relation.relationType]
              } (${formatMapper[relation.node.format]}): [${
                relation.node.title.english ||
                relation.node.title.romaji ||
                relation.node.title.native
              }](${relation.node.siteUrl})`
          )
          .join("\n"),
        inline: false,
      });
    }

    if (media.idMal || media.externalLinks?.length) {
      fields.push({
        name: "Other links",
        value:
          `• [My Anime List](https://myanimelist.net/anime/${media.idMal})\n` +
          media.externalLinks
            ?.map((link) => `• [${link.site}](${link.url})`)
            .join("\n"),
        inline: true,
      });
    }

    const embed: Embed = {
      title:
        (media.isAdult ? "[**NSFW**] " : "") +
        (media.title.english ||
          media.title.romaji ||
          media.title.native),
      url: media.siteUrl,
      color: parseInt(
        media.coverImage.color?.substr(1) || "FFFFFF",
        16
      ),
      description: media.description
        ? cleanUpDescription(media.description)
        : "",
      fields,
      author: {
        name: "Anilist",
        icon_url:
          "https://avatars.githubusercontent.com/u/18018524?s=200&v=4",
        url: "https://anilist.co/home",
      },
    };

    if (data.Page.media.length > 1) {
      embed.footer = {
        text: stringReplacer(messageList.common.page, {
          page: index + 1,
          total: data.Page.media.length,
        }),
      };
    }

    if (!media.isAdult) {
      embed.image = { url: media.coverImage.extraLarge };
    }

    return embed;
  });
};
