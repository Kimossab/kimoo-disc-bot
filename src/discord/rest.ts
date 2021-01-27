import axios from "axios";
import { stringReplacer, string_constants } from "../helper/common";
import Logger from "../helper/logger";

const requester = axios.create({
  baseURL: `https://${process.env.DISCORD_DOMAIN}/api/v${process.env.API_V}`,
  headers: {
    authorization: `Bot ${process.env.TOKEN}`,
  },
});

const _logger = new Logger("rest");

const handleErrors = (place: string, e: any): void => {
  if (e.data) {
    _logger.error(
      `[${place}] ${e.data.code} - ${e.data.message}`,
      e.data.errors
    );
  } else {
    _logger.error(`[${place}] ${e.message}`, e.toJSON());
  }
};

/**
 * Request the gateway bot from discord
 */
export const getGatewayBot = async (): Promise<discord.gateway_bot | null> => {
  try {
    const response = await requester.get("/gateway/bot");

    return response.data;
  } catch (e) {
    handleErrors("getGatewayBot", e);
  }

  return null;
};

// messages
/**
 * Send a message to a channel
 * @param channel Channel id
 * @param content Message
 * @param embed Embed data
 */
export const sendMessage = async (
  channel: string,
  content: string,
  embed: discord.embed | null = null
): Promise<discord.message | null> => {
  try {
    const message: discord.message_request = { content };
    if (embed) {
      message.embed = embed;
    }

    const res = await requester.post(`/channels/${channel}/messages`, message);
    return res.data as discord.message;
  } catch (e) {
    handleErrors("sendMessage", e);
  }
  return null;
};

/**
 * Edits a message on discord
 * @param channel Channel id
 * @param message Message id
 * @param content Message
 * @param embed Embed data
 */
export const editMessage = async (
  channel: string,
  message: string,
  content: string,
  embed: discord.embed | null = null
): Promise<discord.message | null> => {
  try {
    const messageData: discord.message_request = { content };
    if (embed) {
      messageData.embed = embed;
    }

    const res = await requester.patch(
      `/channels/${channel}/messages/${message}`,
      messageData
    );
    return res.data as discord.message;
  } catch (e) {
    handleErrors("editMessage", e);
  }
  return null;
};

// reactions
/**
 * Sends a reaction to a message
 * @param channel Channel id
 * @param message Message id
 * @param reaction Reaction name
 */
export const createReaction = async (
  channel: string,
  message: string,
  reaction: string
): Promise<void> => {
  try {
    await requester.put(
      `/channels/${channel}/messages/${message}/reactions/${encodeURIComponent(
        reaction
      )}/@me`
    );
  } catch (e) {
    handleErrors("createReaction", e);
  }
};

//SLASH COMMANDS
/**
 * Gets the commands for the application
 * @param application Application id
 */
export const getCommands = async (
  application: string
): Promise<discord.application_command[] | null> => {
  try {
    const res = await requester.get(`/applications/${application}/commands`);
    return res.data;
  } catch (e) {
    handleErrors("getCommands", e);
  }
  return null;
};

/**
 * Deletes an existing command with the name in this application
 * @param application Application id
 * @param command Command name
 */
export const deleteCommand = async (
  application: string,
  command: string
): Promise<void> => {
  try {
    await requester.delete(`/applications/${application}/commands/${command}`);
  } catch (e) {
    handleErrors("deleteCommand", e);
  }
};

/**
 * Creates or updates a new command for this application
 * @param application Application id
 * @param command Command data
 */
export const createCommand = async (
  application: string,
  command: discord.application_command
): Promise<discord.application_command | null> => {
  try {
    const res = await requester.post(
      `/applications/${application}/commands`,
      command
    );
    return res.data as discord.application_command;
  } catch (e) {
    handleErrors("createCommand", e);
  }
  return null;
};

/**
 * Sends a response to an interaction
 * @param interaction Interaction id
 * @param token Token string
 * @param data Interaction response data
 */
export const createInteractionResponse = async (
  interaction: string,
  token: string,
  data: discord.interaction_response
): Promise<void> => {
  try {
    const res = await requester.post(
      `/interactions/${interaction}/${token}/callback`,
      data
    );
  } catch (e) {
    handleErrors("createInteractionResponse", e);
  }
};
