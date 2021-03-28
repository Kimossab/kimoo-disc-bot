import RestRateLimitHandler from './rest-rate-limit-handler';

const rateLimiter = new RestRateLimitHandler();

/**
 * Request the gateway bot from discord
 */
export const getGatewayBot = (): Promise<discord.gateway_bot | null> => {
  return rateLimiter.request<discord.gateway_bot>('GET', '/gateway/bot');
};

// messages
/**
 * Send a message to a channel
 * @param channel Channel id
 * @param content Message
 * @param embed Embed data
 */
export const sendMessage = (
  channel: string,
  content: string,
  embed: discord.embed | null = null
): Promise<discord.message | null> => {
  const message: discord.message_request = { content };
  if (embed) {
    message.embed = embed;
  }

  return rateLimiter.request<discord.message>(
    'POST',
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
  embed: discord.embed | null = null
): Promise<discord.message | null> => {
  const messageData: discord.message_request = { content };
  if (embed) {
    messageData.embed = embed;
  }

  return rateLimiter.request<discord.message>(
    'PATCH',
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
): Promise<void | null> => {
  return rateLimiter.request<void>(
    'PUT',
    `/channels/${channel}/messages/${message}/reactions/${encodeURIComponent(
      reaction
    )}/@me`
  );
};

//SLASH COMMANDS
/**
 * Gets the commands for the application
 * @param application Application id
 */
export const getCommands = (
  application: string
): Promise<discord.application_command[] | null> => {
  return rateLimiter.request<discord.application_command[]>(
    'GET',
    `/applications/${application}/commands`
  );
};

/**
 * Deletes an existing command with the name in this application
 * @param application Application id
 * @param command Command name
 */
export const deleteCommand = (
  application: string,
  command: string
): Promise<void | null> => {
  return rateLimiter.request<void>(
    'DELETE',
    `/applications/${application}/commands/${command}`
  );
};

/**
 * Creates or updates a new command for this application
 * @param application Application id
 * @param command Command data
 */
export const createCommand = (
  application: string,
  command: discord.application_command
): Promise<discord.application_command | null> => {
  return rateLimiter.request<discord.application_command>(
    'POST',
    `/applications/${application}/commands`,
    command
  );
};

/**
 * Sends a response to an interaction
 * @param interaction Interaction id
 * @param token Token string
 * @param data Interaction response data
 */
export const createInteractionResponse = (
  interaction: string,
  token: string,
  data: discord.interaction_response
): Promise<void | null> => {
  return rateLimiter.request<void>(
    'POST',
    `/interactions/${interaction}/${token}/callback`,
    data
  );
};

export const editOriginalInteractionResponse = (
  applicationId: string,
  token: string,
  data: discord.edit_webhook_message_request
): Promise<discord.message | null> => {
  return rateLimiter.request<discord.message>(
    'PATCH',
    `/webhooks/${applicationId}/${token}/messages/@original`,
    data
  );
};
