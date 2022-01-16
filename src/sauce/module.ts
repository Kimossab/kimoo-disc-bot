import { editOriginalInteractionResponse } from "../discord/rest";
import {
  getApplication,
  getChannelLastAttachment,
} from "../state/actions";
import messageList from "../helper/messages";
import handleTraceMoe from "./traceMoe/trace-moe";
import handleSauceNao from "./sauceNao/sauce-nao";
import BaseModule from "../base-module";

interface CommandOptions {
  type: "anime" | "art";
  image: string;
}

export default class SauceModule extends BaseModule {
  constructor() {
    super("sauce");

    this.singleCommand = {
      handler: this.commandHandler,
    };
  }

  private commandHandler: SingleCommandHandler = async (
    data
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { type, image } =
        this.getOptions<CommandOptions>(
          ["type", "image"],
          data.data?.options
        );

      const lastAttachment = getChannelLastAttachment(
        data.channel_id
      );

      const url = image || lastAttachment;

      if (!url) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.sauce.image_not_found,
          }
        );
        return;
      }

      if (type === "anime") {
        // anime
        handleTraceMoe(data, url, app, this.logger);
      } else {
        handleSauceNao(data, url, app, this.logger);
      }
    }
  };
}
