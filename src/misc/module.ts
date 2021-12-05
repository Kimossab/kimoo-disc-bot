import { editOriginalInteractionResponse } from "../discord/rest";
import {
  randomNum,
  stringReplacer,
} from "../helper/common";
import { getApplication } from "../state/actions";
import messageList from "../helper/messages";
import renderDonut from "./donut";
import BaseModule from "../base-module";
import { Embed } from "../types/discord";

interface GroupCommandOptions {
  groups: number;
  values: string;
}
interface DonutCommandOptions {
  a: string;
  b: string;
}
const MAX_RANDOM_ANGLE = (1 * Math.PI) / 4;
const MIN_RANDOM_ANGLE = (-1 * Math.PI) / 4;

export default class MiscModule extends BaseModule {
  constructor() {
    super("misc");

    this.commandList = {
      group: {
        handler: this.handleGroupCommand,
      },
      donut: {
        handler: this.handleDonutCommand,
      },
    };
  }

  private handleGroupCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { groups, values } =
        this.getOptions<GroupCommandOptions>(
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

      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: "",
          embeds: [this.groupEmbed(grouped)],
        }
      );
    }
  };

  private handleDonutCommand: CommandHandler = async (
    data,
    option
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { a, b } = this.getOptions<DonutCommandOptions>(
        ["a", "b"],
        option.options
      );
      const nA = Number(a);
      const nB = Number(b);
      let donut: string;

      if (
        a &&
        b &&
        !Number.isNaN(nA) &&
        !Number.isNaN(nB)
      ) {
        donut = renderDonut(nA, nB);
      } else {
        const A =
          Math.PI / 2 +
          (Math.random() *
            (MAX_RANDOM_ANGLE - MIN_RANDOM_ANGLE) +
            MIN_RANDOM_ANGLE);
        const B =
          Math.random() *
            (MAX_RANDOM_ANGLE - MIN_RANDOM_ANGLE) +
          MIN_RANDOM_ANGLE;

        donut = renderDonut(A, B);
      }

      await editOriginalInteractionResponse(
        app.id,
        data.token,
        {
          content: `Here's your donut:\n\`\`\`\n${donut}\`\`\``,
        }
      );

      this.logger.log(
        `Donut was requested in ${data.guild_id} by ${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private groupEmbed = (groups: string[][]): Embed => {
    const embed: Embed = { fields: [] };

    for (const index in groups) {
      embed.fields!.push({
        name: stringReplacer(messageList.misc.group, {
          index: Number(index) + 1,
        }),
        value: groups[index].join(" | "),
      });
    }

    return embed;
  };
}