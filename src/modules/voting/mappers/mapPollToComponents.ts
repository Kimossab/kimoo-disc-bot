import { CompletePoll } from "#voting/database";
import { hasExpired } from "#voting/helpers";
import { ActionRow } from "@/discord/rest/types.gen";

import { chunkArray } from "@/helper/common";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";

export enum PollMessageType {
  VOTE = "vote",
  SETTINGS = "settings"
}

interface MapPollToComponents {
  (poll: CompletePoll, type: PollMessageType.VOTE): ActionRow[];
  (
    poll: CompletePoll,
    type: PollMessageType.SETTINGS,
    user: string,
    singleResponse?: number
  ): ActionRow[];
}

const prefixMap = new Map([
  [PollMessageType.VOTE, ""],
  [PollMessageType.SETTINGS, "setOpt."]
]);

export const mapPollToComponents: MapPollToComponents = (
  poll,
  type: PollMessageType,
  user?: string,
  singleResponse?: number
) => {
  const components: ActionRow[] = [];

  addOptionsComponents(poll, type, components, singleResponse);

  if (type === PollMessageType.VOTE) {
    components.push({
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          custom_id: "voting.create.settings",
          label: "",
          emoji: {
            id: null,
            name: "⚙"
          }
        }
      ]
    });
  } else if (type === PollMessageType.SETTINGS) {
    addSettingsComponents(poll, user, singleResponse, components);
  }

  return components;
};

const addSettingsComponents = (
  poll: CompletePoll,
  user: string | undefined,
  singleResponse: number | undefined,
  components: ActionRow[]
) => {
  const actionRow: ActionRow = {
    type: ComponentType.ActionRow,
    components: []
  };

  const isPollEditable = !hasExpired(poll) && user === poll.creator;
  const canAddAnswers =
    !hasExpired(poll) && (user === poll.creator || poll.usersCanAddAnswers);

  if (canAddAnswers) {
    actionRow.components.push({
      type: ComponentType.Button,
      style: ButtonStyle.Secondary,
      custom_id: "voting.create.add",
      emoji: {
        id: null,
        name: "➕"
      }
    });
  }

  if (singleResponse !== undefined) {
    actionRow.components.push({
      type: ComponentType.Button,
      style: ButtonStyle.Secondary,
      custom_id: "voting.create.setOpt.all",
      label: "Unselect options"
    });

    if (isPollEditable) {
      actionRow.components.push({
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: `voting.create.remove.${singleResponse}`,
        label: "Remove this option"
      });
    }
  }

  if (isPollEditable) {
    actionRow.components.push(
      {
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: "voting.create.close",
        label: "Close the poll"
      },
      {
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: "voting.create.reset",
        label: "Reset votes"
      }
    );
  }
  if (actionRow.components.length) {
    components.push(actionRow);
  }
};

const addOptionsComponents = (
  poll: CompletePoll,
  type: PollMessageType,
  components: ActionRow[],
  singleResponse: number | undefined
) => {
  let i = 0;
  const chunks = chunkArray(poll.pollOptions, 5);

  if (type === PollMessageType.SETTINGS || !hasExpired(poll)) {
    for (const chunk of chunks) {
      components.push({
        type: ComponentType.ActionRow,
        components: chunk.map((option) => ({
          type: ComponentType.Button,
          style: ButtonStyle.Primary,
          disabled: singleResponse === i,
          custom_id: `voting.create.${prefixMap.get(type)}${i++}`,
          label: option.text
        }))
      });
    }
  }
};
