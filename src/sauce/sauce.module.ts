import { createInteractionResponse } from "../discord/rest";
import { interaction_response_type } from "../helper/constants";
import Logger from "../helper/logger";
import {
  getChannelLastAttchment,
  setCommandExecutedCallback
} from "../state/actions";
import messageList from "../helper/messages";
import handleTraceMoe from "./trace-moe";
import handleSauceNao from "./sauce-nao";
import { getOptionValue } from "../helper/modules.helper";

const _logger = new Logger("sauce");
let firstSetup = true;

const commandExecuted = async (data: discord.interaction): Promise<void> => {
  if (data.data && data.data.name === "sauce") {
    const type = getOptionValue<string>(data.data.options, "type");
    const image = getOptionValue<string>(data.data.options, "image");
    const lastAttachment = getChannelLastAttchment(data.channel_id);

    if (!image && !lastAttachment) {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.channel_message_with_source,
        data: {
          content: messageList.sauce.image_not_found
        }
      });
      return;
    }

    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge
    });

    let url = image ?? lastAttachment;

    if (type === "anime") {
      //anime
      handleTraceMoe(data, url);
    } else {
      handleSauceNao(data, url);
    }
  }
};

export const setUp = (): void => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
