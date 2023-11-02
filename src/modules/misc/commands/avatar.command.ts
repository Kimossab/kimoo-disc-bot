import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
  getGuildMember,
} from "@/discord/rest";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackType,
} from "@/types/discord";

interface CommandOptions {
  user: string;
}

const definition: ApplicationCommandOption = {
  name: "avatar",
  description: "Get a user's avatar",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "user",
      description: "Optional user to get the avatar",
      type: ApplicationCommandOptionType.USER,
    },
  ],
};
const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const { user } = getOptions<CommandOptions>(["user"], option.options);
      let userId = data.member!.user!.id;
      let avatar = data.member!.avatar || data.member!.user!.avatar;
      let username =
        data.member!.nick ||
        data.member!.user!.global_name ||
        data.member!.user!.username;
      if (user) {
        const member = await getGuildMember(data.guild_id!, user);
        avatar = member!.avatar || member!.user!.avatar;
        userId = member!.user!.id;
        username =
          member!.nick || member!.user!.global_name || member!.user!.username;
      }

      await editOriginalInteractionResponse(app.id, data.token, {
        content: `${username}'s avatar: https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`,
      });
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler(),
});
