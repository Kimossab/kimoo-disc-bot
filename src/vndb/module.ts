import { editOriginalInteractionResponse } from "../discord/rest";
import Pagination from "../helper/pagination";
import {
  addPagination,
  getApplication,
} from "../state/actions";
import { VNDBApi, vndb_get_vn } from "./vndb-api";
import BaseModule from "../base-module";
import {
  vndbSearchEmbed,
  vndbSearchUpdatePage,
} from "./helper";

export default class VNDBModule extends BaseModule {
  private vndbApi;
  constructor() {
    super("vn");

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

        const result = await this.vndbApi.search(search!);

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

        const message =
          await editOriginalInteractionResponse(
            app.id,
            data.token,
            {
              content: "",
              embeds: [
                vndbSearchEmbed(
                  result[0],
                  1,
                  result.length
                ),
              ],
            }
          );

        if (message) {
          const pagination = new Pagination<vndb_get_vn>(
            data.channel_id,
            message.id,
            result,
            vndbSearchUpdatePage,
            data.token
          );

          addPagination(pagination);
        }
      }
    };
}
