import {
  ApplicationCommand,
  CreateGlobalApplicationCommand,
  CreateMessage,
  EditMessage,
  EditWebhookMessage,
  Embed,
  Emoji,
  GatewayBot,
  GuildMember,
  InteractionResponse,
  Message,
  MessageReference,
  Role
} from "@/types/discord";

import RestRateLimitHandler from "./rest-rate-limit-handler";
import FormData from "form-data";
import fs from "fs";

const rateLimiter = new RestRateLimitHandler();

/**
 * Request the gateway bot from discord
 */
export const getGatewayBot = (): Promise<GatewayBot | null> => rateLimiter.request<GatewayBot>("GET", "/gateway/bot");

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
  embeds?: Embed[],
  reference?: MessageReference
): Promise<Message | null> => {
  if (!content && !embeds) {
    throw new Error("No content or embed provided");
  }

  const message: CreateMessage = {
    content,
    embeds,
    message_reference: reference
  };

  return rateLimiter.request<Message>(
    "POST",
    `/channels/${channel}/messages`,
    message
  );
};

export const editMessage = (
  channel: string,
  message: string,
  data: EditMessage
): Promise<Message | null> => {
  return rateLimiter.request<Message>(
    "PATCH",
    `/channels/${channel}/messages/${message}`,
    data
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
): Promise<void | null> => rateLimiter.request<void>(
  "PUT",
  `/channels/${channel}/messages/${message}/reactions/${encodeURIComponent(reaction)}/@me`
);

// SLASH COMMANDS
/**
 * Gets the commands for the application
 * @param application Application id
 */
export const getCommands = (application: string): Promise<ApplicationCommand[] | null> => rateLimiter.request<ApplicationCommand[]>(
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
): Promise<void | null> => rateLimiter.request<void>(
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
): Promise<ApplicationCommand | null> => rateLimiter.request<ApplicationCommand>(
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

export const giveRole = (
  guildId: string,
  userId: string,
  roleId: string,
  reason?: string
): Promise<null | undefined> => {
  let headers: Record<string, string> | undefined = undefined;

  if (reason) {
    headers = {
      "X-Audit-Log-Reason": reason
    };
  }

  return rateLimiter.request(
    "PUT",
    `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    undefined,
    headers
  );
};

export const removeRole = (
  guildId: string,
  userId: string,
  roleId: string,
  reason?: string
): Promise<null | undefined> => {
  let headers: Record<string, string> | undefined = undefined;

  if (reason) {
    headers = {
      "X-Audit-Log-Reason": reason
    };
  }

  return rateLimiter.request(
    "DELETE",
    `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    undefined,
    headers
  );
};

export const getRoles = (guildId: string): Promise<Role[] | null> => {
  return rateLimiter.request("GET", `/guilds/${guildId}/roles`);
};

export const getEmojis = (guildId: string): Promise<Emoji[] | null> => {
  return rateLimiter.request("GET", `/guilds/${guildId}/emojis`);
};

export const getGuildMember = (
  guildId: string,
  memberId: string
): Promise<GuildMember | null> => {
  return rateLimiter.request("GET", `/guilds/${guildId}/members/${memberId}`);
};
