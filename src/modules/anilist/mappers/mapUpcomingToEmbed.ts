import {
  cleanUpDescription,
  dateToString,
  formatTrailerLink
} from "#anilist/mappers/helperMappers";

import { interpolator } from "@/helper/common";
import {
  createAuthorName,
  createDescription,
  createEmbedField,
  createEmbedFieldList,
  createFooter,
  createTitle
} from "@/helper/embed";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";

import { PageResponse, UpcomingMedia } from "../types/graphql";
import { formatMapper, sourceMapper } from "./enumMapper";
import { RichEmbed, RichEmbedField } from "@/discord/rest/types.gen";

export const mapUpcomingToEmbed = (
  logger: Logger,
  data: PageResponse<UpcomingMedia>
): RichEmbed[] => {
  return data.Page.media.map((media, index) => {
    const fields: RichEmbedField[] = [];

    fields.push(...[
      ...createEmbedFieldList("Other names", [
        `• ${media.title.native}`,
        `• ${media.title.romaji}`
      ]),
      createEmbedField(
        "Format",
        media.format
          ? formatMapper[media.format]
          : "N/A",
        true
      )
    ]);
    const date = dateToString(media.startDate);
    if (date) {
      fields.push(createEmbedField("Start Date", date, true));
    }
    if (media.episodes) {
      fields.push(createEmbedField("Episodes", media.episodes.toString(), true));
    }
    if (media.duration) {
      fields.push(createEmbedField("Duration", media.duration.toString(), true));
    }
    if (media.source) {
      fields.push(createEmbedField("Source", sourceMapper[media.source], true));
    }
    if (media.countryOfOrigin) {
      fields.push(createEmbedField("Country of Origin", media.countryOfOrigin, true));
    }
    if (media.nextAiringEpisode) {
      fields.push(createEmbedField(
        "Next episode",
        `#${media.nextAiringEpisode.episode} - <t:${media.nextAiringEpisode.airingAt}:R>`,
        true
      ));
    }
    if (media.studios?.nodes?.length) {
      fields.push(...createEmbedFieldList(
        "Studios",
        media.studios.nodes.map((studio) => `• ${studio.name}`),
        true
      ));
    }
    if (media.genres?.length) {
      fields.push(createEmbedField("Genres", media.genres.join(", ")));
    }
    if (media.tags?.length) {
      fields.push(createEmbedField(
        "Tags",
        media.tags
          .map((tag) => {
            return tag.isMediaSpoiler ? `||${tag.name}||` : tag.name;
          })
          .join(", ")
      ));
    }

    if (media.idMal || media.externalLinks?.length) {
      const externalLinks =
        media.externalLinks?.map((link) => `• [${link.site}](${link.url})`) ??
        [];

      fields.push(...createEmbedFieldList(
        "Other links",
        [
          `• [My Anime List](https://myanimelist.net/anime/${media.idMal})`,
          ...externalLinks
        ],
        true
      ));
    }

    if (media.trailer) {
      const link = formatTrailerLink(media.trailer);
      if (!link.startsWith("http")) {
        logger.error("UNKNOWN SITE for formatting", {
          trailer: media.trailer,
          animeId: media.id
        });
      }
      fields.push(createEmbedField("Trailer", link, true));
    }

    const embed: RichEmbed = {
      title: createTitle((media.isAdult
        ? "[**NSFW**] "
        : "") +
        (media.title.english || media.title.romaji || media.title.native)),
      url: media.siteUrl,
      color: parseInt(media.coverImage.color?.slice(1) || "FFFFFF", 16),
      description: createDescription(media.description
        ? cleanUpDescription(media.description)
        : ""),
      fields: fields.length > 25
        ? fields.slice(0, 25)
        : fields,
      author: {
        name: createAuthorName("Anilist"),
        icon_url: "https://avatars.githubusercontent.com/u/18018524?s=200&v=4",
        url: "https://anilist.co/home"
      }
    };

    if (data.Page.media.length > 1) {
      embed.footer = {
        text: createFooter(interpolator(messageList.common.page, {
          page: index + 1,
          total: data.Page.media.length
        }))
      };
    }

    if (!media.isAdult) {
      embed.image = { url: media.coverImage.extraLarge };
    }

    return embed;
  });
};
