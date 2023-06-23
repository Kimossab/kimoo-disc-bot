import { editOriginalInteractionResponse } from "@/discord/rest";
import {
  CreatePageCallback,
  InteractionPagination,
} from "@/helper/interaction-pagination";
import Logger from "@/helper/logger";
import messageList from "@/helper/messages";
import { addPagination } from "@/state/store";
import {
  Application,
  ButtonStyle,
  ComponentType,
  Interaction,
} from "@/types/discord";

import { traceMoeEmbed } from "./mapper";
import { requestTraceMoe } from "./request";

const traceMoeUpdatePage: CreatePageCallback<TraceMoe.resultData> = async (
  page,
  total,
  data
) => ({
  data: {
    embeds: [traceMoeEmbed(data, page, total)],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            custom_id: "sauce.select",
            label: "Show to everyone",
          },
        ],
      },
    ],
  },
});

const handleTraceMoe = async (
  data: Interaction,
  image: string,
  app: Partial<Application>,
  logger: Logger
): Promise<void> => {
  // https://soruly.github.io/trace.moe/#
  const traceMoe = await requestTraceMoe(image, logger);

  if (!traceMoe || traceMoe.result.length === 0) {
    await editOriginalInteractionResponse(app.id || "", data.token, {
      content: messageList.sauce.not_found,
    });
    return;
  }

  logger.debug("trace moe response", traceMoe.result);

  const pagination = new InteractionPagination(
    app.id ?? "",
    traceMoe.result,
    traceMoeUpdatePage
  );

  await pagination.create(data.token);
  addPagination(pagination as InteractionPagination);
};

export default handleTraceMoe;
