import { CompleteGiveaway } from "#giveaway/database";
import { RESTPatchAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { mapGiveawayToComponents } from "#giveaway/mappers/mapGiveawayToComponents";
import { mapGiveawayToEmbed } from "#giveaway/mappers/mapGiveawayToEmbed";

export const createGiveawayMessageData = (giveaway: CompleteGiveaway): RESTPatchAPIChannelMessageJSONBody => {
  const embeds = [mapGiveawayToEmbed(giveaway)];
  const components = mapGiveawayToComponents(giveaway);

  const response: RESTPatchAPIChannelMessageJSONBody = { embeds };

  if (components.length) {
    response.components = components;
  }
  return response;
};
