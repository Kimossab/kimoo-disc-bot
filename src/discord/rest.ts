import FormData from "form-data";
import fs from "fs";
import {
  ApplicationCommand,
  CreateGlobalApplicationCommand,
  CreateMessage,
  EditMessage,
  EditWebhookMessage,
  Embed,
  GatewayBot,
  InteractionResponse,
  Message,
} from "../types/discord";
import RestRateLimitHandler from "./rest-rate-limit-handler";

const rateLimiter = new RestRateLimitHandler();

/**
 * Request the gateway bot from discord
 */
export const getGatewayBot =
  (): Promise<GatewayBot | null> =>
    rateLimiter.request<GatewayBot>("GET", "/gateway/bot");

// messages
/**
 * Send a message to a channel
 * @param channel Channel id
 * @param content Message
 * @param embed Embed data
 */
export const sendMessage = (
  channel: string,
  content?: string,
  embeds?: Embed[]
): Promise<Message | null> => {
  if (!content && !embeds) {
    throw new Error("No content or embed provided");
  }

  const message: CreateMessage = { content, embeds };

  return rateLimiter.request<Message>(
    "POST",
    `/channels/${channel}/messages`,
    message
  );
};

/**
 * Edits a message on discord
 * @param channel Channel id
 * @param message Message id
 * @param content Message
 * @param embed Embed data
 */
export const editMessage = (
  channel: string,
  message: string,
  content: string,
  embed: Embed[] | null = null
): Promise<Message | null> => {
  const messageData: EditMessage = { content };
  if (embed) {
    messageData.embeds = embed;
  }

  return rateLimiter.request<Message>(
    "PATCH",
    `/channels/${channel}/messages/${message}`,
    messageData
  );
};

// reactions
/**
 * Sends a reaction to a message
 * @param channel Channel id
 * @param message Message id
 * @param reaction Reaction name
 */
export const createReaction = (
  channel: string,
  message: string,
  reaction: string
): Promise<void | null> =>
  rateLimiter.request<void>(
    "PUT",
    `/channels/${channel}/messages/${message}/reactions/${encodeURIComponent(
      reaction
    )}/@me`
  );

// SLASH COMMANDS
/**
 * Gets the commands for the application
 * @param application Application id
 */
export const getCommands = (
  application: string
): Promise<ApplicationCommand[] | null> =>
  rateLimiter.request<ApplicationCommand[]>(
    "GET",
    `/applications/${application}/commands`
  );

/**
 * Deletes an existing command with the name in this application
 * @param application Application id
 * @param command Command name
 */
export const deleteCommand = (
  application: string,
  command: string
): Promise<void | null> =>
  rateLimiter.request<void>(
    "DELETE",
    `/applications/${application}/commands/${command}`
  );

/**
 * Creates or updates a new command for this application
 * @param application Application id
 * @param command Command data
 */
export const createCommand = (
  application: string,
  command: CreateGlobalApplicationCommand
): Promise<ApplicationCommand | null> =>
  rateLimiter.request<ApplicationCommand>(
    "POST",
    `/applications/${application}/commands`,
    command
  );

/**
 * Sends a response to an interaction
 * @param interaction Interaction id
 * @param token Token string
 * @param data Interaction response data
 */
export const createInteractionResponse = (
  interaction: string,
  token: string,
  data: InteractionResponse,
  image?: string
): Promise<void | null> => {
  if (image) {
    const formData = new FormData();
    const file = fs.createReadStream(image);
    formData.append("file", file);
    formData.append("payload_json", JSON.stringify(data));

    return rateLimiter.request<void>(
      "POST",
      `/interactions/${interaction}/${token}/callback`,
      formData,
      formData.getHeaders()
    );
  }
  return rateLimiter.request<void>(
    "POST",
    `/interactions/${interaction}/${token}/callback`,
    data
  );
};

export const editOriginalInteractionResponse = (
  applicationId: string,
  token: string,
  data: EditWebhookMessage,
  image?: string
): Promise<Message | null> => {
  if (image) {
    const formData = new FormData();
    const file = fs.createReadStream(image);
    formData.append("file", file);
    formData.append("payload_json", JSON.stringify(data));

    return rateLimiter.request<Message>(
      "PATCH",
      `/webhooks/${applicationId}/${token}/messages/@original`,
      formData,
      formData.getHeaders()
    );
  }
  return rateLimiter.request<Message>(
    "PATCH",
    `/webhooks/${applicationId}/${token}/messages/@original`,
    data
  );
};
