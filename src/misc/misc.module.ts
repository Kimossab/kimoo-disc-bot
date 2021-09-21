import { createInteractionResponse, editOriginalInteractionResponse } from "../discord/rest";
import { randomNum, stringReplacer } from "../helper/common";
import Logger from "../helper/logger";
import { getApplication, setCommandExecutedCallback } from "../state/actions";
import { interaction_response_type } from "../helper/constants";
import messageList from "../helper/messages";
import { getOption, getOptionValue } from "../helper/modules.helper";
import renderDonut from "./donut";

let firstSetup = true;

const _logger = new Logger("misc");

const MAX_RANDOM_ANGLE = 1 * Math.PI / 4;
const MIN_RANDOM_ANGLE = -1 * Math.PI / 4;

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

const handleGroupCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const groups = getOptionValue<number>(option.options, "groups");
  const values = getOptionValue<string>(option.options, "values");

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
};

const handleDonutCommand = async (
  data: discord.interaction,
  option: discord.application_command_interaction_data_option
): Promise<void> => {
  const app = getApplication();

  if (app) {
    const a = getOptionValue<string>(option.options, 'a');
    const nA = Number(a);
    const b = getOptionValue<string>(option.options, 'b');
    const nB = Number(b);

    let donut: string;

    if (a && b && !Number.isNaN(nA) && !Number.isNaN(nB)) {
      donut = renderDonut(nA, nB);
    } else {
      const A = Math.PI / 2 + (Math.random() * (MAX_RANDOM_ANGLE - MIN_RANDOM_ANGLE) + MIN_RANDOM_ANGLE);
      const B = Math.random() * (MAX_RANDOM_ANGLE - MIN_RANDOM_ANGLE) + MIN_RANDOM_ANGLE;

      donut = renderDonut(A, B);
    }

    await editOriginalInteractionResponse(app.id, data.token, {
      content: `Here's your donut:\n\`\`\`\n${donut}\`\`\``
    });

    _logger.log(
      `Donut was requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
    );
  }
};

const commandExecuted = async (data: discord.interaction) => {
  if (data.data && data.data.name === "misc" && data.data.options) {
    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source,
    });

    const group = getOption(data.data.options, 'group');
    const donut = getOption(data.data.options, 'donut');

    if (group) {
      return await handleGroupCommand(data, group);
    }

    if (donut) {
      return await handleDonutCommand(data, donut);
    }

    _logger.error(
      'UNKNOWN COMMAND',
      data.data.options[0].name,
      data.data.options[0].options,
      data.data.options[0].value
    );

    const app = getApplication();
    if (app) {
      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.common.internal_error,
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
