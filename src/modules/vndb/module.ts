import BaseModule from "#/base-module";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import { InteractionPagination } from "@/helper/interaction-pagination";
import { getOptions } from "@/helper/modules";
import { addPagination, getApplication } from "@/state/store";
import {
  ApplicationCommandOptionType,
  InteractionCallbackType,
  SingleCommandHandler,
} from "@/types/discord";

import { vndbSearchUpdatePage } from "./helper";
import { VNDBApi } from "./vndb-api";

export default class VNDBModule extends BaseModule {
  private vndbApi;
  constructor(isActive: boolean) {
    super("vn", isActive);
    if (!isActive) {
      this.logger.info("Module deactivated");
      return;
    }

    this.vndbApi = new VNDBApi();

    this.singleCommand = {
      definition: {
        name: "vn",
        description: "Gets Visual Novel information",
        options: [
          {
            name: "search",
            description: "Title to search for",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
      handler: this.handleSearchCommand,
    };
  }

  private handleSearchCommand: SingleCommandHandler = async (data) => {
    const app = getApplication();
    if (app && app.id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const { search } = getOptions<{
        search: string;
      }>(["search"], data.data?.options);

      const result = await this.vndbApi?.search(search);

      if (!result || result.length === 0) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: "not found",
        });
        return;
      }

      const pagination = new InteractionPagination(
        app.id,
        result,
        vndbSearchUpdatePage
      );

      await pagination.create(data.token);
      addPagination(pagination as InteractionPagination);
    }
  };
}
