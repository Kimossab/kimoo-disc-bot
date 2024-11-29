import { CompleteGiveaway } from "#giveaway/database";
import { mapGiveawayToComponents } from "#giveaway/mappers/mapGiveawayToComponents";
import { mapGiveawayToEmbed } from "#giveaway/mappers/mapGiveawayToEmbed";
import { MessageEditRequestPartial } from "@/discord/rest/types.gen";


export const createGiveawayMessageData = (giveaway: CompleteGiveaway): MessageEditRequestPartial => {
  const embeds = [mapGiveawayToEmbed(giveaway)];
  const components = mapGiveawayToComponents(giveaway);

  const response: MessageEditRequestPartial = {
    embeds
  };

  if (components.length) {
    response.components = components;
  }
  return response;
};
