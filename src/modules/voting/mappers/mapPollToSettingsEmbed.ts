import { IPoll } from "#voting/models/Poll.model";

import { Embed } from "@/types/discord";

export const mapPollToSettingsEmbed = (
  poll: IPoll,
  singleResponse?: number
): Embed => {
  let values: string[] = [];
  let responses: (number | string)[] = [];

  if (singleResponse !== undefined) {
    const option = poll.options[singleResponse];

    values = [option.text];
    responses = [option.votes.map((v) => `<@${v}>`).join("\n")];
  } else {
    const res = (JSON.parse(JSON.stringify(poll.options)) as IPoll["options"])
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

    values = res.values;
    responses = res.responses;
  }

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
        name: "Creation Date",
        value: `<t:${Math.floor(+poll.startAt / 1000)}>`,
        inline: false,
      },
      {
        name: "Running days",
        value: poll.days.toString(),
        inline: false,
      },
      {
        name: "Is Multiple Choice?",
        value: poll.multipleChoice ? "Yes" : "No",
        inline: false,
      },
    ],
    footer: {
      text: "Select an option below to see who voted on it.",
    },
  };

  return embed;
};
