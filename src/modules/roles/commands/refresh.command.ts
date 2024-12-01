import { CommandHandler, CommandInfo } from "#base-module";

import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  InteractionResponseType,
  MessageFlags,
} from "discord-api-types/v10";
import { createInteractionResponse, editOriginalInteractionResponse } from "@/discord/rest";
import { getApplication } from "@/state/store";
import messageList from "@/helper/messages";

const definition: APIApplicationCommandOption = {
  name: "refresh",
  description: messageList.roles.refresh.description,
  type: ApplicationCommandOptionType.Subcommand,
};

const handler = (updateRoleMessages: (server: string) => Promise<void>): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app?.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: { flags: MessageFlags.Ephemeral },
      });
      await updateRoleMessages(data.guild_id);

      await editOriginalInteractionResponse(app.id, data.token, { content: messageList.roles.refresh.success });
    }
  };
};

export default (updateRoleMessages: (server: string) => Promise<void>): CommandInfo => ({
  definition,
  handler: handler(updateRoleMessages),
  isAdmin: true,
});
