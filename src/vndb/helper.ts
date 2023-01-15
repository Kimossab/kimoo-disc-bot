import { stringReplacer } from "../helper/common";
import { CreatePageCallback } from "../helper/interaction-pagination";
import messageList from "../helper/messages";
import { Embed } from "../types/discord";
import * as ReturnData from "./types/returnData";
import {
  LENGTH_TYPE,
  RELATION_TYPES,
  sexual,
  violence,
} from "./types/vndb";
import { vndb_get_vn } from "./vndb-api";

const codeReplaces = [
  {
    regex: /\[url=([^\]]*)\]([^[]*)\[\/url\]/gm,
    replace: "[$2]($1)",
  },
  {
    regex: /"/gm,
    replace: "'",
  },
];

export const replaceDescriptionCodes = (
  text: string
): string => {
  for (const rep of codeReplaces) {
    text = text.replace(rep.regex, rep.replace);
  }

  return text;
};

export const groupRelations = (
  relations: ReturnData.get_vn_single_relation[]
): string[] => {
  const returnValues: string[] = [];
  const group: Record<string, string[]> = {};

  for (const rel of relations) {
    if (group[rel.relation]) {
      group[rel.relation].push(
        `${rel.official ? "" : "[Unofficial] "}[${
          rel.title
        }](https://vndb.org/v${rel.id})`
      );
    } else {
      group[rel.relation] = [
        `${rel.official ? "" : "[Unofficial] "}[${
          rel.title
        }](https://vndb.org/v${rel.id})`,
      ];
    }
  }

  let returnStr = "";
  for (const rel in group) {
    if (Object.prototype.hasOwnProperty.call(group, rel)) {
      const relArr = group[rel];

      const relationString = `**${
        RELATION_TYPES[rel] ? RELATION_TYPES[rel] : rel
      }**\n- ${relArr.join("\n- ")}\n`;

      if (
        returnStr.length + relationString.length >=
        1024
      ) {
        returnValues.push(returnStr);
        returnStr = "";
      }
      returnStr += relationString;
    }
  }

  returnValues.push(returnStr);

  return returnValues;
};

export const vndbSearchEmbed = (
  item: vndb_get_vn,
  page: number,
  total: number
): Embed => {
  const embed: Embed = {
    title: `${item.title}`,
    url: `https://vndb.org/v${item.id}`,
    color: 3035554,
    fields: [
      {
        name: "Rating",
        value: item.rating.toString(),
        inline: true,
      },
      {
        name: "Length",
        value:
          item.length && LENGTH_TYPE[item.length]
            ? LENGTH_TYPE[item.length]
            : "Unknwown",
        inline: true,
      },
      {
        name: "Release Date",
        value: item.released ?? "N/A",
        inline: true,
      },
      {
        name: "Languages",
        value: item.languages.join(", "),
        inline: true,
      },
      {
        name: "Platforms",
        value: item.platforms.join(", "),
        inline: true,
      },
    ],
    footer: {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    },
  };

  if (item.original) {
    embed.title += ` (${item.original})`;
  }

  if (item.description) {
    embed.description = replaceDescriptionCodes(
      item.description
    );
  }

  if (
    item.image &&
    item.image_flagging &&
    item.image_flagging.sexual_avg === sexual.safe &&
    item.image_flagging.violence_avg === violence.tame
  ) {
    embed.image = {
      url: item.image,
    };
  }

  if (item.relations.length) {
    const groupRel = groupRelations(item.relations);

    for (let index = 0; index < groupRel.length; index++) {
      embed.fields?.push({
        name: index === 0 ? "Related VNs" : ".",
        value: groupRel[index],
        inline: false,
      });
    }
  }

  return embed;
};

export const vndbSearchUpdatePage: CreatePageCallback<
  vndb_get_vn
> = async (page, total, data) => ({
  data: { embeds: [vndbSearchEmbed(data, page, total)] },
});
