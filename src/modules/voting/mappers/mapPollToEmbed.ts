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

  const daysInSeconds = poll.days * 60 * 60 * 24;
  const endingDate = Math.floor(+poll.startAt / 1000) + daysInSeconds;

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
        value: `<t:${endingDate}:R>`,
        inline: false,
      },
    ],
  };

  return embed;
};
