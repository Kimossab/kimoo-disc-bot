import { IPoll } from "#voting/models/Poll.model";

import { chunkArray } from "@/helper/common";
import { ActionRow, ButtonStyle, ComponentType } from "@/types/discord";

export const mapPollToComponents = (
  poll: IPoll,
  prefix?: string
): ActionRow[] => {
  const components: ActionRow[] = [];

  let i = 0;
  const chunks = chunkArray(poll.options, 5);
  for (const chunk of chunks) {
    components.push({
      type: ComponentType.ActionRow,
      components: chunk.map((option) => ({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: `voting.create.${prefix ? `${prefix}.` : ""}${i++}`,
        label: option.text,
      })),
    });
  }

  return components;
};
