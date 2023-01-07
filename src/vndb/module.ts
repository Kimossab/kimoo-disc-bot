import { editOriginalInteractionResponse } from "../discord/rest";
import {
  addPagination,
  getApplication,
} from "../state/actions";
import { VNDBApi } from "./vndb-api";
import BaseModule from "../base-module";
import { vndbSearchUpdatePage } from "./helper";
import { InteractionPagination } from "../helper/interaction-pagination";

export default class VNDBModule extends BaseModule {
  private vndbApi;
  constructor(isActive: boolean) {
    super("vn", isActive);
    if (!isActive) {
      this.logger.log("Module deactivated");
      return;
    }

    this.vndbApi = new VNDBApi();

    this.singleCommand = {
      handler: this.handleSearchCommand,
    };
  }

  private handleSearchCommand: SingleCommandHandler =
    async (data) => {
      const app = getApplication();
      if (app && app.id) {
        const { search } = this.getOptions<{
          search: string;
        }>(["search"], data.data?.options);

        const result = await this.vndbApi?.search(search);

        if (!result || result.length === 0) {
          await editOriginalInteractionResponse(
            app.id,
            data.token,
            {
              content: "not found",
            }
          );
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
