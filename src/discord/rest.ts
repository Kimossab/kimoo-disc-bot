import { Snowflake } from "discord-api-types/globals";
import RestRateLimitHandler from "./rest-rate-limit-handler";
import FormData from "form-data";
import fs from "fs";
import { RESTGetAPIGatewayBotResult } from "discord-api-types/rest/v10/gateway";

const rateLimiter = new RestRateLimitHandler();


export const getGatewayBot = () => rateLimiter.request<RESTGetAPIGatewayBotResult>("GET", "/gateway/bot");

// messages
export const sendMessage = (
  channel: SnowflakeType,
  content?: string,
  embeds?: RichEmbed[],
  reference?: MessageReferenceRequest
) => {
  const message: MessageCreateRequest = {
    content,
    embeds,
    message_reference: reference
  };

  validate("MessageCreateRequest", message);

  return rateLimiter.request<MessageResponse>(
    "POST",
    `/channels/${channel}/messages`,
    message
  );
};

export const editMessage = (
  channel: Snowflake,
  message: SnowflakeType,
  data: MessageEditRequestPartial
) => {
  validate("MessageEditRequestPartialSchema", data);

  return rateLimiter.request<MessageResponse>(
    "PATCH",
    `/channels/${channel}/messages/${message}`,
    data
  );
};

// reactions
export const createReaction = (
  channel: SnowflakeType,
  message: SnowflakeType,
  reaction: string
) => rateLimiter.request<void>(
  "PUT",
  `/channels/${channel}/messages/${message}/reactions/${encodeURIComponent(reaction)}/@me`
);

// SLASH COMMANDS
export const getCommands = (application: SnowflakeType) => rateLimiter.request<ApplicationCommandResponse[]>(
  "GET",
  `/applications/${application}/commands`
);

export const createCommand = (
  application: SnowflakeType,
  command: ApplicationCommandCreateRequest
) => {
  validate("ApplicationCommandCreateRequest", command);

  rateLimiter.request<ApplicationCommandResponse>(
    "POST",
    `/applications/${application}/commands`,
    command
  );
};

export const deleteCommand = (
  application: SnowflakeType,
  command: SnowflakeType
) => rateLimiter.request<void>(
  "DELETE",
  `/applications/${application}/commands/${command}`
);

export const createInteractionResponse = (
  interaction: SnowflakeType,
  token: string,
  data: CreateInteractionResponseData["body"],
  image?: string
) => {
  validateAny([
    "ApplicationCommandAutocompleteCallbackRequest",
    "CreateMessageInteractionCallbackRequest",
    "LaunchActivityInteractionCallbackRequest",
    "ModalInteractionCallbackRequest",
    "PongInteractionCallbackRequest",
    "UpdateMessageInteractionCallbackRequest"
  ], data);

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
  applicationId: SnowflakeType,
  token: string,
  data: IncomingWebhookUpdateRequestPartial,
  image?: string,
  threadId?: SnowflakeType
) => {
  validate("IncomingWebhookUpdateRequestPartial", data);

  const threadQuery = !!threadId ? `?thread_id=${threadId}` : "";

  if (image) {
    const formData = new FormData();
    const file = fs.createReadStream(image);
    formData.append("file", file);
    formData.append("payload_json", JSON.stringify(data));

    return rateLimiter.request<MessageResponse>(
      "PATCH",
      `/webhooks/${applicationId}/${token}/messages/@original${threadQuery}`,
      formData,
      formData.getHeaders()
    );
  }
  return rateLimiter.request<MessageResponse>(
    "PATCH",
    `/webhooks/${applicationId}/${token}/messages/@original${threadQuery}`,
    data
  );
};

export const giveRole = (
  guildId: SnowflakeType,
  userId: SnowflakeType,
  roleId: SnowflakeType,
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
  guildId: SnowflakeType,
  userId: SnowflakeType,
  roleId: SnowflakeType,
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

export const getRoles = (guildId: SnowflakeType) => {
  return rateLimiter.request<GuildRoleResponse[]>("GET", `/guilds/${guildId}/roles`);
};

export const getEmojis = (guildId: SnowflakeType) => {
  return rateLimiter.request<EmojiResponse[]>("GET", `/guilds/${guildId}/emojis`);
};

export const getGuildMember = (
  guildId: SnowflakeType,
  memberId: SnowflakeType
) => {
  return rateLimiter.request<GuildMemberResponse>("GET", `/guilds/${guildId}/members/${memberId}`);
};
