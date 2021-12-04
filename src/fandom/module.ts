import { editOriginalInteractionResponse } from "../discord/rest";
import Pagination from "../helper/pagination";
import {
  addPagination,
  getApplication,
} from "../state/actions";
import { FANDOM_LINKS } from "../helper/constants";
import messageList from "../helper/messages";
import BaseModule from "../base-module";
import { requestFandom } from "./request";

interface CommandOptions {
  fandom: string;
  query: string;
}

export default class FandomModule extends BaseModule {
  constructor() {
    super("wiki");
    this.singleCommand = {
      handler: this.commandHandler,
      isAdmin: false,
    };
  }

  private commandHandler: SingleCommandHandler = async (
    data
  ) => {
    const app = getApplication();
    if (app && app.id) {
      const { fandom, query } =
        this.getOptions<CommandOptions>(
          ["fandom", "query"],
          data.data?.options
        );

      if (!query || !fandom || fandom.includes(" ")) {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: messageList.fandom.invalid_slug,
          }
        );
        return;
      }

      const fandomSlug = FANDOM_LINKS[fandom]
        ? FANDOM_LINKS[fandom]
        : fandom;

      const links = await requestFandom(fandomSlug, query);

      if (links) {
        const message =
          await editOriginalInteractionResponse(
            app.id,
            data.token,
            {
              content: links[0],
            }
          );

        if (message) {
          const pagination = new Pagination<string>(
            data.channel_id,
            message.id,
            links,
            this.updatePage,
            data.token
          );

          addPagination(pagination);
        }
      } else {
        await editOriginalInteractionResponse(
          app.id,
          data.token,
          {
            content: "Nothing found",
          }
        );
      }

      this.logger.log(
        `${query} queried for ${fandom} in ${data.guild_id} by ` +
          `${data.member.user?.username}#${data.member.user?.discriminator}`
      );
    }
  };

  private async updatePage(
    data: string,
    _page: number,
    _total: number,
    token: string
  ): Promise<void> {
    const app = getApplication();
    if (app && app.id) {
      await editOriginalInteractionResponse(app.id, token, {
        content: data,
      });
    }
  }
}
