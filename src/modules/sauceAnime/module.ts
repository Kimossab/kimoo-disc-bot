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
  InteractionCallbackDataFlags,
  InteractionCallbackType,
  Message,
  SingleCommandHandler,
} from "@/types/discord";

import handleTraceMoe from "./traceMoe/trace-moe";

export default class SauceAnimeModule extends BaseModule {
  constructor(isActive: boolean) {
    super("sauce", isActive, "Sauce (anime)");

    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.commandDescription[AvailableLocales.English_US] =
      "Handles everything related to achievements";

    this.singleCommand = {
      definition: {
        name: "Sauce (anime)",
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
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });

      const msgs = (
        Object.values(data.data?.resolved?.messages ?? {}) as Message[]
      )
        .map((m) => {
          if (m.attachments.length) {
            return m.attachments[0].url || null;
          }
          if (m.embeds.length) {
            return m.embeds.find((e) => e.type === "image")?.url || null;
          }
          return null;
        })
        .filter((m) => m !== null);

      if (!msgs.length) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.sauce.image_not_found,
        });
        return;
      }

      const url = msgs[0]!;

      handleTraceMoe(data, url, app, this.logger);
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
