import { CompletePoll } from "#voting/database";

import { Embed, EmbedField } from "@/types/discord";

const votingEmbedFields = (
  poll: CompletePoll,
  singleResponse: number
): EmbedField[] => {
  const option = poll.pollOptions[singleResponse];

  const responses = option.pollOptionVotes
    .map((v) => `<@${v.user}>`)
    .join("\n");

  return [
    {
      name: option.text,
      value: responses || "No votes",
    },
  ];
};

export const mapPollToSettingsEmbed = (
  poll: CompletePoll,
  user: string,
  singleResponse?: number
): Embed => {
  const userVotes = poll.pollOptions
    .filter((o) => o.pollOptionVotes.map((o) => o.user).includes(user))
    .map((o) => `\`${o.text}\``)
    .join(" ");

  const embed: Embed = {
    title: poll.question,
    description: `Your votes: ${
      userVotes || "no votes"
    }.\n\nClick in one of the blue buttons below to see who voted in that option.`,
  };
  if (singleResponse !== undefined) {
    embed.fields = votingEmbedFields(poll, singleResponse);
  } else {
    embed.fields = [
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
      {
        name: "Users can add new answers?",
        value: poll.usersCanAddAnswers ? "Yes" : "No",
        inline: false,
      },
      {
        name: "Poll creator",
        value: `<@${poll.creator}>`,
        inline: false,
      },
    ];
  }

  return embed;
};
