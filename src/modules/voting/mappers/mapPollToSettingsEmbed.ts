import { IPoll } from "#voting/models/Poll.model";

import { Embed, EmbedField } from "@/types/discord";

const votingEmbedFields = (
  poll: IPoll,
  singleResponse: number
): EmbedField[] => {
  const option = poll.options[singleResponse];

  const responses = option.votes.map((v) => `<@${v}>`).join("\n");

  return [
    {
      name: option.text,
      value: responses || "No votes",
    },
  ];
};

export const mapPollToSettingsEmbed = (
  poll: IPoll,
  user: string,
  singleResponse?: number
): Embed => {
  const userVotes = poll.options
    .filter((o) => o.votes.includes(user))
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
