import { APIEmbed } from "discord-api-types/v10";
import { CompletePoll } from "#voting/database";

export const mapPollToEmbed = (poll: CompletePoll): APIEmbed => {
  const { values, responses } = (
    JSON.parse(JSON.stringify(poll.pollOptions)) as CompletePoll["pollOptions"]
  )
    .sort((a, b) => b.pollOptionVotes.length - a.pollOptionVotes.length)
    .reduce<{
    values: string[];
    responses: number[];
  }>(
      (acc, option) => {
        acc.values.push(option.text);
        acc.responses.push(option.pollOptionVotes.length);
        return acc;
      },
      {
        values: [],
        responses: [],
      },
    );

  const daysInSeconds = poll.days * 60 * 60 * 24;
  const endingDate = Math.floor(+poll.startAt / 1000) + daysInSeconds;

  const embed: APIEmbed = {
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
