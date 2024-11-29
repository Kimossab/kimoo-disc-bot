import BaseModule, { ComponentCommandHandler, SingleCommandHandler } from "#/base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import messageList from "@/helper/messages";
import { getApplication } from "@/state/store";

import handleSauceNao from "./sauceNao/sauce-nao";
import { APIMessageApplicationCommandInteractionData, ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, Locale, MessageFlags } from "discord-api-types/v10";

export default class SauceArtModule extends BaseModule {
  constructor (isActive: boolean) {
    super("sauceArt", isActive, "Sauce (art)");

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[Locale.EnglishUS] =
      "Handles everything related to achievements";

    this.singleCommand = {
      definition: {
        name: "Sauce (art)",
        type: ApplicationCommandType.Message
      },
      handler: this.commandHandler,
      componentHandler: this.componentHandler
    };
  }

  private commandHandler: SingleCommandHandler = async (data) => {
    const responseData = data.data as APIMessageApplicationCommandInteractionData | undefined;
    const app = getApplication();
    if (app && app.id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral
        }
      });

      const msgs = Object.values(responseData?.resolved?.messages ?? {});

      if (!msgs.length || !msgs[0].attachments.length) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.sauce.image_not_found
        });
        return;
      }

      const url = msgs[0].attachments[0].url;

      handleSauceNao(data, url, app, this.logger);
    }
  };

  private componentHandler: ComponentCommandHandler = async (data) => {
    const app = getApplication();
    if (app && app.id && data.message) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: data.message.content,
          embeds: [
            { ...data.message.embeds[0],
              footer: undefined }
          ],
          components: []
        }
      });
    }
  };
}
