import { CommandInfo } from "#base-module";
import renderDonut from "#misc/donut";

import { editOriginalInteractionResponse } from "@/discord/rest";
import Logger from "@/helper/logger";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
} from "@/types/discord";

interface DonutCommandOptions {
  a: string;
  b: string;
}

const MAX_RANDOM_ANGLE = (1 * Math.PI) / 4;
const MIN_RANDOM_ANGLE = (-1 * Math.PI) / 4;

const definition: ApplicationCommandOption = {
  name: "donut",
  description: "Create a donut",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "a",
      description: "Angle of A (radians)",
      type: ApplicationCommandOptionType.STRING,
    },
    {
      name: "b",
      description: "Angle of B (radians)",
      type: ApplicationCommandOptionType.STRING,
    },
  ],
};
const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id) {
      const { a, b } = getOptions<DonutCommandOptions>(
        ["a", "b"],
        option.options
      );
      const nA = Number(a);
      const nB = Number(b);
      let donut: string;

      if (a && b && !Number.isNaN(nA) && !Number.isNaN(nB)) {
        donut = renderDonut(nA, nB);
      } else {
        const A =
          Math.PI / 2 +
          (Math.random() * (MAX_RANDOM_ANGLE - MIN_RANDOM_ANGLE) +
            MIN_RANDOM_ANGLE);
        const B =
          Math.random() * (MAX_RANDOM_ANGLE - MIN_RANDOM_ANGLE) +
          MIN_RANDOM_ANGLE;

        donut = renderDonut(A, B);
      }

      await editOriginalInteractionResponse(app.id, data.token, {
        content: `Here's your donut:\n\`\`\`\n${donut}\`\`\``,
      });

      logger.log(
        `Donut was requested in ${data.guild_id} by ${
          (data.member || data).user?.username
        }#${(data.member || data).user?.discriminator}`
      );
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
});
