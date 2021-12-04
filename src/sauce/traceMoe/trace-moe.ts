import Pagination from "../../helper/pagination";
import messageList from "../../helper/messages";
import { editOriginalInteractionResponse } from "../../discord/rest";
import Logger from "../../helper/logger";
import {
  addPagination,
  getApplication,
} from "../../state/actions";
import { requestTraceMoe } from "./request";
import { traceMoeEmbed } from "./mapper";
import {
  Application,
  Interaction,
} from "../../types/discord";

const traceMoeUpdatePage = async (
  data: TraceMoe.resultData,
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app && app.id) {
    await editOriginalInteractionResponse(app.id, token, {
      content: "",
      embeds: [traceMoeEmbed(data, page, total)],
    });
  }
};

const handleTraceMoe = async (
  data: Interaction,
  image: string,
  app: Partial<Application>,
  logger: Logger
): Promise<void> => {
  // https://soruly.github.io/trace.moe/#/
  const traceMoe = await requestTraceMoe(image, logger);

  if (!traceMoe || traceMoe.result.length === 0) {
    await editOriginalInteractionResponse(
      app.id || "",
      data.token,
      {
        content: messageList.sauce.not_found,
      }
    );
    return;
  }

  const message = await editOriginalInteractionResponse(
    app.id || "",
    data.token,
    {
      content: "",
      embeds: [
        traceMoeEmbed(
          traceMoe.result[0],
          1,
          traceMoe.result.length
        ),
      ],
    }
  );

  if (message && data.channel_id) {
    const pagination = new Pagination<TraceMoe.resultData>(
      data.channel_id,
      message.id,
      traceMoe.result,
      traceMoeUpdatePage,
      data.token
    );

    addPagination(pagination);
  }
};

export default handleTraceMoe;
