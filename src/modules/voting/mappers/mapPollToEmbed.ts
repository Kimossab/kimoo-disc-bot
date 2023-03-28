import { IPoll } from "#voting/models/Poll.model";

import { Embed } from "@/types/discord";

export const mapPollToEmbed = (poll: IPoll): Embed => {
  const { values, responses } = (
    JSON.parse(JSON.stringify(poll.options)) as IPoll["options"]
  )
    .sort((a, b) => b.votes.length - a.votes.length)
    .reduce<{
      values: string[];
      responses: number[];
    }>(
      (acc, option) => {
        acc.values.push(option.text);
        acc.responses.push(option.votes.length);
        return acc;
      },
      { values: [], responses: [] }
    );

  const embed: Embed = {
    title: poll.question,
    fields: [
      {
        name: "Option",
        value: values.join("\n"),
        inline: true,
      },
      {
        name: "Responses",
        value: responses.join("\n"),
        inline: true,
      },
      {
        name: "Ending",
        value: `<t:${Math.floor(
          +poll.startAt.setDate(poll.startAt.getDate() + 1) / 1000
        )}:R>`,
        inline: false,
      },
    ],
  };

  return embed;
};
