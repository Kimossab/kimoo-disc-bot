import BaseModule from "#/base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import messageList from "@/helper/messages";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandType,
  AvailableLocales,
  ComponentCommandHandler,
  InteractionCallbackType,
  Message,
  MessageFlags,
  SingleCommandHandler,
} from "@/types/discord";

import handleSauceNao from "./sauceNao/sauce-nao";

export default class SauceArtModule extends BaseModule {
  constructor(isActive: boolean) {
    super("sauceArt", isActive, "Sauce (art)");

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Handles everything related to achievements";

    this.singleCommand = {
      definition: {
        name: "Sauce (art)",
        type: ApplicationCommandType.MESSAGE,
      },
      handler: this.commandHandler,
      componentHandler: this.componentHandler,
    };
  }

  private commandHandler: SingleCommandHandler = async (data) => {
    const app = getApplication();
    if (app && app.id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: MessageFlags.EPHEMERAL,
        },
      });

      const msgs = Object.values(
        data.data?.resolved?.messages ?? {}
      ) as Message[];

      if (!msgs.length || !msgs[0].attachments.length) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.sauce.image_not_found,
        });
        return;
      }

      const url = msgs[0].attachments[0].url;

      handleSauceNao(data, url, app, this.logger);
    }
  };

  private componentHandler: ComponentCommandHandler = async (data) => {
    const app = getApplication();
    if (app && app.id && data.message && data.channel_id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: data.message.content,
          embeds: [{ ...data.message.embeds[0], footer: undefined }],
          components: [],
        },
      });
    }
  };
}
