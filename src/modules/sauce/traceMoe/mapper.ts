import { formatSecondsIntoMinutes, stringReplacer } from "@/helper/common";
import messageList from "@/helper/messages";
import { Embed } from "@/types/discord";

export const traceMoeEmbed = (
  item: TraceMoe.resultData,
  page: number,
  total: number
): Embed => {
  let title: string[] = [];

  if (item.anilist.title?.english) {
    title.push(item.anilist.title.english);
  }

  if (item.anilist.title?.romaji) {
    title.push(item.anilist.title.romaji);
  }

  if (item.anilist.title?.native) {
    title.push(item.anilist.title.native);
  }

  title = title.filter((elem, index, self) => index === self.indexOf(elem));

  const description: string[] = [];

  if (item.episode) {
    description.push(`Episode #${item.episode}`);
  }
  description.push(`@${formatSecondsIntoMinutes(item.from)}`);

  const embed: Embed = {
    title: title.length ? title.join(" - ") : "UNKNOWN",
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
      value: item.anilist.synonyms.join(" | "),
    });
  }

  embed.fields?.push({
    name: "⠀",
    value: `[Video](${item.video})`,
  });

  return embed;
};
