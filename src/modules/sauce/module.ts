import BaseModule from "#/base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import messageList from "@/helper/messages";
import { getApplication } from "@/state/store";
import { Message, SingleCommandHandler } from "@/types/discord";

import handleSauceNao from "./sauceNao/sauce-nao";
import handleTraceMoe from "./traceMoe/trace-moe";

export default class SauceModule extends BaseModule {
  constructor(isActive: boolean) {
    super("sauce", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.singleCommand = {
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

      const type = data.data?.name.split(" ")[1].slice(1, -1) as
        | "anime"
        | "art";

      if (type === "anime") {
        // anime
        handleTraceMoe(data, url, app, this.logger);
      } else {
        handleSauceNao(data, url, app, this.logger);
      }
    }
  };
}
