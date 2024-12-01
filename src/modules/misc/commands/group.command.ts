import { CommandHandler, CommandInfo } from "#base-module";

import {
  APIApplicationCommandOption,
  APIEmbed,
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import { createInteractionResponse, editOriginalInteractionResponse } from "@/discord/rest";
import { getApplication } from "@/state/store";
import { getOptions } from "@/helper/modules";
import { interpolator, randomNum } from "@/helper/common";
import messageList from "@/helper/messages";

interface GroupCommandOptions {
  groups: number;
  values: string;
}

const definition: APIApplicationCommandOption = {
  name: "group",
  description: "Create random groups",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "groups",
      description: "Number of groups to create",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: "values",
      description: "Names to group (seperate each name with ` | `)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

const groupEmbed = (groups: string[][]): APIEmbed => {
  const embed: APIEmbed = { fields: [] };

  for (const index in groups) {
    embed.fields = [
      ...embed.fields ?? [],
      {
        name: interpolator(messageList.misc.group, { index: Number(index) + 1 }),
        value: groups[index].join(" | "),
      },
    ];
  }

  return embed;
};

const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id) {
      await createInteractionResponse(data.id, data.token, { type: InteractionResponseType.DeferredChannelMessageWithSource });

      const { groups, values } = getOptions<GroupCommandOptions>(
        ["groups", "values"],
        option.options,
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
        embeds: [groupEmbed(grouped)],
      });
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler(),
});
