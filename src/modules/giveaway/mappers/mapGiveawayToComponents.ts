import { CompleteGiveaway } from "#giveaway/database";
import { ActionRow } from "@/discord/rest/types.gen";
import { ComponentType, ButtonStyle } from "discord-api-types/v10";


export const mapGiveawayToComponents = (giveaway: CompleteGiveaway): ActionRow[] => {
  if (giveaway.endAt < new Date()) {
    return [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Danger,
            custom_id: "giveaway.create.reshuffle",
            label: "Reshuffle"
          }
        ]
      }
    ];
  } else {
    return [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            custom_id: "giveaway.create.join",
            label: "JOIN"
          }
        ]
      }
    ];
  }
};
