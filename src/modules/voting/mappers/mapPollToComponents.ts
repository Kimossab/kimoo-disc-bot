import { hasExpired } from "#voting/helpers";
import { IPoll } from "#voting/models/Poll.model";

import { chunkArray } from "@/helper/common";
import { ActionRow, ButtonStyle, ComponentType } from "@/types/discord";

export enum PollMessageType {
  VOTE = "vote",
  SETTINGS = "settings",
}

interface MapPollToComponents {
  (poll: IPoll, type: PollMessageType.VOTE): ActionRow[];
  (
    poll: IPoll,
    type: PollMessageType.SETTINGS,
    user: string,
    singleResponse?: number
  ): ActionRow[];
}

const prefixMap = new Map([
  [PollMessageType.VOTE, ""],
  [PollMessageType.SETTINGS, "setOpt."],
]);

export const mapPollToComponents: MapPollToComponents = (
  poll,
  type: PollMessageType,
  user?: string,
  singleResponse?: number
) => {
  const components: ActionRow[] = [];

  let i = 0;
  const chunks = chunkArray(poll.options, 5);
  for (const chunk of chunks) {
    components.push({
      type: ComponentType.ActionRow,
      components: chunk.map((option) => ({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        disabled: singleResponse === i,
        custom_id: `voting.create.${prefixMap.get(type)}${i++}`,
        label: option.text,
      })),
    });
  }

  if (type === PollMessageType.VOTE) {
    components.push({
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          custom_id: `voting.create.settings`,
          label: "",
          emoji: {
            id: null,
            name: "⚙",
          },
        },
      ],
    });
  } else if (type === PollMessageType.SETTINGS) {
    const actionRow: ActionRow = {
      type: ComponentType.ActionRow,
      components: [],
    };

    const isPollEditable = !hasExpired(poll) && user === poll.creator;
    const canAddAnswers =
      !hasExpired(poll) && (user === poll.creator || poll.usersCanAddAnswers);

    if (canAddAnswers) {
      actionRow.components.push({
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: `voting.create.add`,
        emoji: {
          id: null,
          name: "➕",
        },
      });
    }

    if (singleResponse !== undefined) {
      actionRow.components.push({
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: `voting.create.setOpt.all`,
        label: "Unselect options",
      });

      if (isPollEditable) {
        actionRow.components.push({
          type: ComponentType.Button,
          style: ButtonStyle.Danger,
          custom_id: `voting.create.remove.${singleResponse}`,
          label: `Remove this option`,
        });
      }
    }

    if (actionRow.components.length) {
      components.push(actionRow);
    }
  }

  return components;
};
