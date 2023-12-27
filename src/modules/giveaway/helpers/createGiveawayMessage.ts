import { mapGiveawayToComponents } from "#giveaway/mappers/mapGiveawayToComponents";
import { mapGiveawayToEmbed } from "#giveaway/mappers/mapGiveawayToEmbed";
import { IGiveaway } from "#giveaway/models/Giveaway.model";

import { EditWebhookMessage } from "@/types/discord";

export const createGiveawayMessageData = (
  giveaway: IGiveaway
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
