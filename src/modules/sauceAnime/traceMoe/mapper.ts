import { formatSecondsIntoMinutes, stringReplacer } from "@/helper/common";
import messageList from "@/helper/messages";
import { Embed } from "@/types/discord";

export const traceMoeEmbed = (
  item: TraceMoe.resultData,
  page: number,
  total: number
): Embed => {
  const title =
    item.anilist.title.romaji ||
    item.anilist.title.english ||
    item.anilist.title.native;

  const description: string[] = [];

  if (item.episode) {
    description.push(`Episode #${item.episode}`);
  }
  description.push(`@${formatSecondsIntoMinutes(item.from)}`);

  const embed: Embed = {
    title: title || "UNKNOWN",
    description: description.join(" "),
    color: 3035554,
    url: `https://myanimelist.net/anime/${item.anilist.idMal}`,
    fields: [
      {
        name: messageList.sauce.similarity,
        value: `${Math.round(item.similarity * 100)}%`,
      },
    ],
    image: {
      url: item.image,
    },
    footer: {
      text: stringReplacer(messageList.common.page, {
        page,
        total,
      }),
    },
  };

  if (item.anilist.synonyms?.length > 0) {
    embed.fields?.push({
      name: messageList.sauce.other_names,
      value: [
        item.anilist.title.romaji,
        item.anilist.title.english,
        item.anilist.title.native,
      ].join("\n"),
    });
  }

  embed.fields?.push({
    name: "⠀",
    value: `[Video](${item.video})`,
  });
  return embed;
};
