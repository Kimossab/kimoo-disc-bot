import { Snowflake } from "discord-api-types/globals";
import RestRateLimitHandler from "./rest-rate-limit-handler";
import FormData from "form-data";
import fs from "fs";
import { APIEmbed } from "discord-api-types/v10";
import { RESTAPIMessageReference, RESTGetAPIApplicationCommandsResult, RESTGetAPIGatewayBotResult, RESTGetAPIGuildEmojisResult, RESTGetAPIGuildMemberResult, RESTGetAPIGuildRolesResult, RESTPatchAPIChannelMessageJSONBody, RESTPatchAPIChannelMessageResult, RESTPatchAPIInteractionOriginalResponseJSONBody, RESTPatchAPIInteractionOriginalResponseResult, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelMessageResult, RESTPostAPIInteractionCallbackJSONBody } from "discord-api-types/v10";

const rateLimiter = new RestRateLimitHandler();


export const getGatewayBot = () => rateLimiter.request<RESTGetAPIGatewayBotResult>("GET", "/gateway/bot");

// messages
export const sendMessage = (
  channel: Snowflake,
  content?: string,
  embeds?: APIEmbed[],
  reference?: RESTAPIMessageReference
) => {
  const message: RESTPostAPIChannelMessageJSONBody = {
    content,
    embeds,
    message_reference: reference
  };

  return rateLimiter.request<RESTPostAPIChannelMessageResult>(
    "POST",
    `/channels/${channel}/messages`,
    message
  );
};

export const editMessage = (
  channel: Snowflake,
  message: Snowflake,
  data: RESTPatchAPIChannelMessageJSONBody
) => rateLimiter.request<RESTPatchAPIChannelMessageResult>(
  "PATCH",
  `/channels/${channel}/messages/${message}`,
  data
);

// reactions
export const createReaction = (
  channel: Snowflake,
  message: Snowflake,
  reaction: string
) => rateLimiter.request<void>(
  "PUT",
  `/channels/${channel}/messages/${message}/reactions/${encodeURIComponent(reaction)}/@me`
);

// SLASH COMMANDS
export const getCommands = (application: Snowflake) => rateLimiter.request<RESTGetAPIApplicationCommandsResult>(
  "GET",
  `/applications/${application}/commands`
);

export const createCommand = (
  application: Snowflake,
  command: RESTPostAPIApplicationCommandsJSONBody
) => rateLimiter.request<RESTPostAPIApplicationCommandsResult>(
  "POST",
  `/applications/${application}/commands`,
  command
);

export const deleteCommand = (
  application: Snowflake,
  command: Snowflake
) => rateLimiter.request<void>(
  "DELETE",
  `/applications/${application}/commands/${command}`
);

export const createInteractionResponse = (
  interaction: Snowflake,
  token: string,
  data: RESTPostAPIInteractionCallbackJSONBody,
  image?: string
) => {
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
  applicationId: Snowflake,
  token: string,
  data: RESTPatchAPIInteractionOriginalResponseJSONBody,
  image?: string,
  threadId?: Snowflake
) => {
  const threadQuery = !!threadId ? `?thread_id=${threadId}` : "";

  if (image) {
    const formData = new FormData();
    const file = fs.createReadStream(image);
    formData.append("file", file);
    formData.append("payload_json", JSON.stringify(data));

    return rateLimiter.request<RESTPatchAPIInteractionOriginalResponseResult>(
      "PATCH",
      `/webhooks/${applicationId}/${token}/messages/@original${threadQuery}`,
      formData,
      formData.getHeaders()
    );
  }
  return rateLimiter.request<RESTPatchAPIInteractionOriginalResponseResult>(
    "PATCH",
    `/webhooks/${applicationId}/${token}/messages/@original${threadQuery}`,
    data
  );
};

export const giveRole = (
  guildId: Snowflake,
  userId: Snowflake,
  roleId: Snowflake,
  reason?: string
) => {
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
  guildId: Snowflake,
  userId: Snowflake,
  roleId: Snowflake,
  reason?: string
) => {
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

export const getRoles = (guildId: Snowflake) => {
  return rateLimiter.request<RESTGetAPIGuildRolesResult>("GET", `/guilds/${guildId}/roles`);
};

export const getEmojis = (guildId: Snowflake) => {
  return rateLimiter.request<RESTGetAPIGuildEmojisResult>("GET", `/guilds/${guildId}/emojis`);
};

export const getGuildMember = (
  guildId: Snowflake,
  memberId: Snowflake
) => {
  return rateLimiter.request<RESTGetAPIGuildMemberResult>("GET", `/guilds/${guildId}/members/${memberId}`);
};
