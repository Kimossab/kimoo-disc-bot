import { editOriginalInteractionResponse } from "../discord/rest";
import {
  addPagination,
  getApplication,
} from "../state/actions";
import { FANDOM_LINKS } from "../helper/constants";
import messageList from "../helper/messages";
import BaseModule from "../base-module";
import { requestFandom } from "./request";
import {
  CreatePageCallback,
  InteractionPagination,
} from "../helper/interaction-pagination";

interface CommandOptions {
  fandom: string;
  query: string;
}

export default class FandomModule extends BaseModule {
  constructor(isActive: boolean) {
    super("wiki", isActive);

    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

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
        this.logger.log("links", links);
        const pagination = new InteractionPagination(
          app.id,
          links,
          this.updatePage
        );

        await pagination.create(data.token);
        addPagination(pagination);
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

  private updatePage: CreatePageCallback<string> = async (
    _page: number,
    _total: number,
    data: string
  ) => ({
    data: {
      content: data,
    },
  });
}
