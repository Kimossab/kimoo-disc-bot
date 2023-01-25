import BaseModule from "#/base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import messageList from "@/helper/messages";
import { getApplication } from "@/state/store";
import {
  ApplicationCommandType,
  AvailableLocales,
  Message,
  SingleCommandHandler,
} from "@/types/discord";

import handleSauceNao from "./sauceNao/sauce-nao";

export default class SauceArtModule extends BaseModule {
  constructor(isActive: boolean) {
    super("sauceArt", isActive);

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
    };
  }

  private commandHandler: SingleCommandHandler = async (data) => {
    const app = getApplication();
    if (app && app.id) {
      this.logger.log("sauce command", data);

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
}
