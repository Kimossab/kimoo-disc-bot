import { createInteractionResponse } from "../discord/rest";
import { randomNum, stringReplacer } from "../helper/common";
import Logger from "../helper/logger";
import { setCommandExecutedCallback } from "../state/actions";
import { interaction_response_type } from "../helper/constants";
import messageList from "../helper/messages";
import { getOptionValue } from "../helper/modules.helper";

let firstSetup = true;

const _logger = new Logger("misc");

const groupEmbed = (groups: string[][]): discord.embed => {
  const embed: discord.embed = { fields: [] };

  for (const index in groups) {
    embed.fields!.push({
      name: stringReplacer(messageList.misc.group, {
        index: Number(index) + 1
      }),
      value: groups[index].join(" | ")
    });
  }

  return embed;
};

const commandExecuted = async (data: discord.interaction) => {
  if (data.data && data.data.name === "misc" && data.data.options) {
    if (data.data.options[0].name === "group") {
      const options = data.data.options[0].options;

      const groups = getOptionValue<number>(options, "groups");
      const values = getOptionValue<string>(options, "values");

      let names = values!.split(" | ");
      const count = names.length / groups!;

      const grouped = [];

      for (let i = 0; i < groups!; i++) {
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

      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.channel_message_with_source,
        data: {
          content: "",
          embeds: [groupEmbed(grouped)]
        }
      });
    }
  }
};

export const SetUp = () => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
