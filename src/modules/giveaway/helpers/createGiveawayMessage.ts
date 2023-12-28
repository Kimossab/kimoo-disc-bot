import { CompleteGiveaway } from "#giveaway/database";
import { mapGiveawayToComponents } from "#giveaway/mappers/mapGiveawayToComponents";
import { mapGiveawayToEmbed } from "#giveaway/mappers/mapGiveawayToEmbed";

import { EditWebhookMessage } from "@/types/discord";

export const createGiveawayMessageData = (
  giveaway: CompleteGiveaway
): EditWebhookMessage => {
  const embeds = [mapGiveawayToEmbed(giveaway)];
  const components = mapGiveawayToComponents(giveaway);

  const response: EditWebhookMessage = {
    embeds,
  };

  if (components.length) {
    response.components = components;
  }
  return response;
};
