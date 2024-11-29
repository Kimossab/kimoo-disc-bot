import { CommandHandler, CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { ApplicationCommandSubcommandOption } from "@/discord/rest/types.gen";
import messageList from "@/helper/messages";
import { getApplication } from "@/state/store";
import { ApplicationCommandOptionType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";

const definition: ApplicationCommandSubcommandOption = {
  name: "refresh",
  description: messageList.roles.refresh.description,
  type: ApplicationCommandOptionType.Subcommand
};

const handler = (updateRoleMessages: (server: string) => Promise<void>): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app?.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral
        }
      });
      await updateRoleMessages(data.guild_id);

      await editOriginalInteractionResponse(app.id, data.token, {
        content: messageList.roles.refresh.success
      });
    }
  };
};

export default (updateRoleMessages: (server: string) => Promise<void>): CommandInfo => ({
  definition,
  handler: handler(updateRoleMessages),
  isAdmin: true
});
