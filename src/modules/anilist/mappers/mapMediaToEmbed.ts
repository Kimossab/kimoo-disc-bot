import {
  cleanUpDescription,
  formatReleasingDate
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
import messageList from "@/helper/messages";

import { MediaList, PageResponse } from "../types/graphql";
import {
  formatMapper,
  relationMapper,
  seasonMapper,
  sourceMapper,
  statusMapper,
  typeMapper
} from "./enumMapper";
import { RichEmbed, RichEmbedField } from "@/discord/rest/types.gen";

export const mapMediaToEmbed = (data: PageResponse<MediaList>): RichEmbed[] => {
  return data.Page.media.map((media, index) => {
    const fields: RichEmbedField[] = [];

    fields.push(...[
      ...createEmbedFieldList("Other names", [
        `• ${media.title.native}`,
        `• ${media.title.romaji}`
      ]),
      createEmbedField("Type", typeMapper[media.type], true),
      createEmbedField("Format", formatMapper[media.format], true),
      createEmbedField("Status", statusMapper[media.status], true)
    ]);
    const dates = formatReleasingDate(media.startDate, media.endDate);
    if (dates) {
      fields.push(createEmbedField("Airing Dates", dates, true));
    }
    if (media.season) {
      fields.push(createEmbedField("Season", seasonMapper[media.season], true));
    }
    if (media.episodes) {
      fields.push(createEmbedField("Episodes", media.episodes.toString(), true));
    }
    if (media.duration) {
      fields.push(createEmbedField("Duration", media.duration.toString(), true));
    }
    if (media.volumes) {
      fields.push(createEmbedField("Volumes", media.volumes.toString(), true));
    }
    if (media.source) {
      fields.push(createEmbedField("Source", sourceMapper[media.source], true));
    }
    if (media.averageScore) {
      fields.push(createEmbedField("Average score", media.averageScore.toString(), true));
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
    if (media.relations.edges.length) {
      const relationTextList = media.relations.edges.map((relation) => `• ${relationMapper[relation.relationType]} (${
        formatMapper[relation.node.format]
      }): [${
        relation.node.title.english ||
        relation.node.title.romaji ||
        relation.node.title.native
      }](${relation.node.siteUrl})`);

      fields.push(...createEmbedFieldList("Relations", relationTextList));
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
