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

const traceMoeUpdatePage = async (
  data: TraceMoe.resultData,
  page: number,
  total: number,
  token: string
): Promise<void> => {
  const app = getApplication();
  if (app) {
    await editOriginalInteractionResponse(app.id, token, {
      content: "",
      embeds: [traceMoeEmbed(data, page, total)],
    });
  }
};

const handleTraceMoe = async (
  data: discord.interaction,
  image: string,
  app: discord.application_object,
  logger: Logger
): Promise<void> => {
  // https://soruly.github.io/trace.moe/#/
  const traceMoe = await requestTraceMoe(image, logger);

  if (!traceMoe || traceMoe.result.length === 0) {
    await editOriginalInteractionResponse(
      app.id,
      data.token,
      {
        content: messageList.sauce.not_found,
      }
    );
    return;
  }

  const message = await editOriginalInteractionResponse(
    app.id,
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

  if (message) {
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
