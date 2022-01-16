import messageList from "../../helper/messages";
import { editOriginalInteractionResponse } from "../../discord/rest";
import Logger from "../../helper/logger";
import { addPagination } from "../../state/actions";
import { requestTraceMoe } from "./request";
import { traceMoeEmbed } from "./mapper";
import {
  Application,
  Interaction,
} from "../../types/discord";
import {
  CreatePageCallback,
  InteractionPagination,
} from "../../helper/interaction-pagination";

const traceMoeUpdatePage: CreatePageCallback<TraceMoe.resultData> =
  async (page, total, data) => ({
    data: {
      embeds: [traceMoeEmbed(data, page, total)],
    },
  });

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

  const pagination = new InteractionPagination(
    app.id ?? "",
    traceMoe.result,
    traceMoeUpdatePage
  );

  await pagination.create(data.token);
  addPagination(pagination);
};

export default handleTraceMoe;
