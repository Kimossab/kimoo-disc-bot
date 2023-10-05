import Logger from "@/helper/logger";

import ServerSettings, { IServerSettings } from "./server-settings.model";

const _logger = new Logger("bot.controller");

/**
 * Adds a new guild to the database if it doesn't exist yet
 * @param id Guild to store
 */
export const saveGuild = async (id: string): Promise<void> => {
  try {
    const exists = await ServerSettings.exists({
      serverId: id,
    });

    if (!exists) {
      const server = new ServerSettings();
      server.serverId = id;
      server.language = "EN";
      server.adminRole = null;
      server.animeChannel = null;
      server.birthdayChannel = null;
      server.lastBirthdayWishes = null;
      server.birthdayRole = null;
      await server.save();
    }
  } catch (e) {
    _logger.error("Saving guild", e);
  }
};

/**
 * Sets the channel used by the bot to post anime notifications
 * @param server Server id to set the channel
 * @param channel Channel id for anime notifications
 */
export const setServerAnimeChannel = async (server: string, channel: string) =>
  ServerSettings.updateOne({ serverId: server }, { animeChannel: channel });

/**
 * Get the anime channel id for a server
 * @param id Server id to get the channel
 */
export const getServerAnimeChannel = async (
  id: string
): Promise<Nullable<string>> => {
  const server = await ServerSettings.findOne({
    serverId: id,
  });

  return server?.animeChannel;
};

/**
 * Sets the channel used by the bot to post birthday messages
 * @param server Server id to set the channel
 * @param channel Channel id for birthday messages
 */
export const setServerBirthdayChannel = async (
  server: string,
  channel: string
) =>
  ServerSettings.updateOne(
    {
      serverId: server,
    },
    { birthdayChannel: channel }
  );

/**
 * Get the birthday channel id for a server
 * @param id Server id to get the channel
 */
export const getServerBirthdayChannel = async (
  id: string
): Promise<Nullable<string>> => {
  const server = await ServerSettings.findOne({
    serverId: id,
  });

  return server?.birthdayChannel;
};

export const setServerBirthdayRole = async (server: string, role: string) =>
  ServerSettings.updateOne(
    {
      serverId: server,
    },
    { birthdayRole: role }
  );

export const getServerBirthdayRole = async (
  id: string
): Promise<Nullable<string>> => {
  const server: Nullable<IServerSettings> = await ServerSettings.findOne({
    serverId: id,
  });

  return server?.birthdayRole;
};

/**
 * Updates the year of last time a server was wished a happy birthday
 * @param server Server id to set the value
 */
export const updateServerLastWishes = async (server: string) =>
  ServerSettings.updateOne(
    {
      serverId: server,
    },
    { lastBirthdayWishes: new Date().getFullYear() }
  );

/**
 * Gets the last year a server was wished a happy birthday
 * @param id Server to get the date from
 */
export const getLastServerBirthdayWishes = async (
  id: string
): Promise<Nullable<number>> => {
  const server: Nullable<IServerSettings> = await ServerSettings.findOne({
    serverId: id,
  });

  return server?.lastBirthdayWishes;
};

/**
 * Sets the role that will be used to check for admin permissions for bot commands
 * @param server Server id to set the role
 * @param role Role id that should be used as admin
 */
export const setAdminRole = async (server: string, role: string) =>
  ServerSettings.updateOne(
    {
      serverId: server,
    },
    { adminRole: role }
  );

/**
 * Gets the role that's used to check for admin permissions for bot commands
 * @param id Server id
 */
export const getAdminRole = async (id: string): Promise<Nullable<string>> => {
  const server: Nullable<IServerSettings> = await ServerSettings.findOne({
    serverId: id,
  });

  return server?.adminRole;
};

export const setServerRoleChannel = async (server: string, channel: string) =>
  ServerSettings.updateOne({ serverId: server }, { roleChannel: channel });

export const getServerRoleChannel = async (
  id: string
): Promise<Nullable<string>> => {
  const server = await ServerSettings.findOne({
    serverId: id,
  });

  return server?.roleChannel;
};
