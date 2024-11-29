import { CompleteGiveaway } from "#giveaway/database";
import { RichEmbed } from "@/discord/rest/types.gen";

export const mapGiveawayToEmbed = (giveaway: CompleteGiveaway): RichEmbed => {
  const embed: RichEmbed = {
    title: "Giveaway 🎁",
    fields: [
      {
        name: "Prize",
        value: giveaway.prize,
        inline: true
      },
      {
        name: "Given by",
        value: `<@${giveaway.creatorId}>`,
        inline: true
      },
      {
        name: "Participants",
        value: giveaway.participants.length.toString(),
        inline: true
      }
    ]
  };

  const winner = giveaway.participants.find((p) => p.isWinner);

  if (winner) {
    embed.fields!.push({
      name: "Winner",
      value: `<@${winner.userId}>`,
      inline: false
    });
  } else {
    embed.fields!.push({
      name: "Ending",
      value: `<t:${Math.floor(+giveaway.endAt / 1000)}:R>`,
      inline: false
    });
  }

  return embed;
};
