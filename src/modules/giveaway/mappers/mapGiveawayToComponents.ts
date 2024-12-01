import {
  APIActionRowComponent,
  APIButtonComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { CompleteGiveaway } from "#giveaway/database";

export const mapGiveawayToComponents = (giveaway: CompleteGiveaway): APIActionRowComponent<APIButtonComponent>[] => {
  if (giveaway.endAt < new Date()) {
    return [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Danger,
            custom_id: "giveaway.create.reshuffle",
            label: "Reshuffle",
          },
        ],
      },
    ];
  }
  else {
    return [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            custom_id: "giveaway.create.join",
            label: "JOIN",
          },
        ],
      },
    ];
  }
};
