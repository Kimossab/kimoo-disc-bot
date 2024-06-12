import { CommandInfo } from "#base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import messageList from "@/helper/messages";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
  InteractionCallbackDataFlags,
  InteractionCallbackType
} from "@/types/discord";

const definition: ApplicationCommandOption = {
  name: "refresh",
  description: messageList.roles.refresh.description,
  type: ApplicationCommandOptionType.SUB_COMMAND
};

const handler = (updateRoleMessages: (server: string) => Promise<void>): CommandHandler => {
  return async (data) => {
    const app = getApplication();
    if (app?.id && data.guild_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL
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
