import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { interpolator, randomNum } from "@/helper/common";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  Embed,
  InteractionCallbackType
} from "@/types/discord";

interface GroupCommandOptions {
  groups: number;
  values: string;
}

const definition: ApplicationCommandOption = {
  name: "group",
  description: "Create random groups",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "groups",
      description: "Number of groups to create",
      type: ApplicationCommandOptionType.INTEGER,
      required: true
    },
    {
      name: "values",
      description: "Names to group (seperate each name with ` | `)",
      type: ApplicationCommandOptionType.STRING,
      required: true
    }
  ]
};

const groupEmbed = (groups: string[][]): Embed => {
  const embed: Embed = { fields: [] };

  for (const index in groups) {
    embed.fields = [
      ...embed.fields ?? [],
      {
        name: interpolator(messageList.misc.group, {
          index: Number(index) + 1
        }),
        value: groups[index].join(" | ")
      }
    ];
  }

  return embed;
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
      });

      const { groups, values } = getOptions<GroupCommandOptions>(
        ["groups", "values"],
        option.options
      );

      if (!groups || !values) {
        return;
      }

      const names = values.split(" | ");
      const count = names.length / groups;

      const grouped = [];

      for (let i = 0; i < groups; i++) {
        const g = [];

        const max = Math.min(count, names.length);

        for (let j = 0; j < max; j++) {
          const pos = randomNum(0, names.length);

          g.push(names[pos]);
          names.splice(pos, 1);
        }
        if (g.length > 0) {
          grouped.push(g);
        }
      }

      await editOriginalInteractionResponse(app.id, data.token, {
        content: "",
        embeds: [groupEmbed(grouped)]
      });
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler()
});
