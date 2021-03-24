import axios from "axios";
import {
  createInteractionResponse,
  editMessage,
  sendMessage
} from "../discord/rest";
import Logger from "../helper/logger";
import Pagination from "../helper/pagination";
import { addPagination, setCommandExecutedCallback } from "../state/actions";
import { FANDOM_LINKS, interaction_response_type } from "../helper/constants";
import messageList from "../helper/messages";
import { getOptionValue } from "../helper/modules.helper";

const _logger = new Logger("fandom");
let firstSetup: boolean = true;

const requestFandom = async (
  fandom: string,
  query: string
): Promise<string[] | null> => {
  const r = await axios.get(
    `https://${fandom}.fandom.com/api.php?action=opensearch&search=${encodeURIComponent(
      query
    )}`
  );

  if (r.data.length > 1) {
    return r.data[r.data.length - 1];
  }
  return null;
};

const updatePage = async (
  channel: string,
  message: string,
  data: string,
  page: number,
  total: number
): Promise<void> => {
  await editMessage(channel, message, data);
};

const commandExecuted = async (data: discord.interaction): Promise<void> => {
  if (data.data && data.data.name === "wiki" && data.data.options) {
    const slug = getOptionValue<string>(data.data.options, "fandom");
    const query = getOptionValue<string>(data.data.options, "query");

    if (slug!.includes(" ")) {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.channel_message_with_source,
        data: {
          content: messageList.fandom.invalid_slug
        }
      });

      return;
    }

    await createInteractionResponse(data.id, data.token, {
      type: interaction_response_type.acknowledge_with_source
    });

    const fandom = FANDOM_LINKS[slug!] ? FANDOM_LINKS[slug!] : slug!;

    const links = await requestFandom(fandom, query!);

    if (links) {
      const message = await sendMessage(data.channel_id, links[0]);
      if (message) {
        const pagination = new Pagination<string>(
          data.channel_id,
          message.id,
          links,
          updatePage
        );

        addPagination(pagination);
      }
    }
  }
};

export const setUp = (): void => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);

    firstSetup = false;
  }
};
