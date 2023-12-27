import { IGiveaway } from "#giveaway/models/Giveaway.model";

import { Embed } from "@/types/discord";

export const mapGiveawayToEmbed = (giveaway: IGiveaway): Embed => {
  const embed: Embed = {
    title: "Giveaway 🎁",
    fields: [
      {
        name: "Prize",
        value: giveaway.prize,
        inline: true,
      },
      {
        name: "Given by",
        value: `<@${giveaway.creatorId}>`,
        inline: true,
      },
      {
        name: "Participants",
        value: giveaway.participants.length.toString(),
        inline: true,
      },
    ],
  };

  if (giveaway.winner) {
    embed.fields!.push({
      name: "Winner",
      value: `<@${giveaway.winner}>`,
      inline: false,
    });
  } else {
    embed.fields!.push({
      name: "Ending",
      value: `<t:${Math.floor(+giveaway.endAt / 1000)}:R>`,
      inline: false,
    });
  }

  return embed;
};
