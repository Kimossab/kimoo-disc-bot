import { CommandHandler, CommandInfo } from "#base-module";

import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import {
  createInteractionResponse,
  editOriginalInteractionResponse,
  getGuildMember,
} from "@/discord/rest";
import { getApplication } from "@/state/store";
import { getOptions } from "@/helper/modules";

interface CommandOptions {
  user: string;
}

const definition: APIApplicationCommandOption = {
  name: "avatar",
  description: "Get a user's avatar",
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: "user",
      description: "Optional user to get the avatar",
      type: ApplicationCommandOptionType.User,
    },
  ],
};
const handler = (): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id) {
      await createInteractionResponse(data.id, data.token, { type: InteractionResponseType.DeferredChannelMessageWithSource });

      const { user } = getOptions<CommandOptions>(["user"], option.options);
      let userId = data.member!.user!.id;
      let avatar: string | undefined | null = data.member!.avatar || data.member!.user!.avatar;
      let username
        = data.member!.nick
        || data.member!.user!.global_name
        || data.member!.user!.username;
      if (user) {
        const member = await getGuildMember(data.guild_id!, user);
        avatar = member!.avatar || member!.user!.avatar;
        userId = member!.user!.id;
        username
          = member!.nick || member!.user!.global_name || member!.user!.username;
      }

      await editOriginalInteractionResponse(app.id, data.token, { content: `${username}'s avatar: https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` });
    }
  };
};

export default (): CommandInfo => ({
  definition,
  handler: handler(),
});
