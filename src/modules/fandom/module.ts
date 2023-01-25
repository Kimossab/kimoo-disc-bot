import BaseModule from "#/base-module";

import { editOriginalInteractionResponse } from "@/discord/rest";
import { FANDOM_LINKS } from "@/helper/constants";
import {
  CreatePageCallback,
  InteractionPagination,
} from "@/helper/interaction-pagination";
import messageList from "@/helper/messages";
import { getOptions } from "@/helper/modules";
import { addPagination, getApplication } from "@/state/store";
import {
  ApplicationCommandOptionType,
  AvailableLocales,
  SingleCommandHandler,
} from "@/types/discord";

import { requestFandom } from "./request";

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

    this.commandDescription[AvailableLocales.English_US] =
      "Search for an article from a fandom";

    this.singleCommand = {
      definition: {
        name: "wiki",
        description: "Search for an article from a fandom",
        options: [
          {
            name: "fandom",
            description: "Slug of the fandom to search",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "query",
            description: "Search query",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
      handler: this.commandHandler,
      isAdmin: false,
    };
  }

  private commandHandler: SingleCommandHandler = async (data) => {
    const app = getApplication();
    if (app && app.id) {
      const { fandom, query } = getOptions<CommandOptions>(
        ["fandom", "query"],
        data.data?.options
      );

      if (!query || !fandom || fandom.includes(" ")) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.fandom.invalid_slug,
        });
        return;
      }

      const fandomSlug = FANDOM_LINKS[fandom] ? FANDOM_LINKS[fandom] : fandom;

      const links = await requestFandom(fandomSlug, query);

      if (links) {
        this.logger.log("links", links);
        const pagination = new InteractionPagination(
          app.id,
          links,
          this.updatePage
        );

        await pagination.create(data.token);
        addPagination(pagination as InteractionPagination);
      } else {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "Nothing found",
        });
      }

      this.logger.log(
        `${query} queried for ${fandom} in ${data.guild_id} by ` +
          `${(data.member || data).user?.username}#${
            (data.member || data).user?.discriminator
          }`
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
