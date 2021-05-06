// common
export const PRESENCE_STRINGS = [
  'Doing witchy things',
  "It's not that I know everything, I just know what I know",
  'El Psy Kongroo',
  'Tuturu',
  "I'm working, I suppose",
  'Shitsurei, kamimashita',
  '01001000 01100101 01101100 01101100 01101111 00100000 01110111 01101111 01110010 01101100 01100100',
  "Who's that cute witch flying in this summer sky? That's right, it's me, Elaina",
  'EMT',
  "Who's Rem?",
  'As you like my pleasure',
  'Sono me, dare no me?',
  'Whose eyes are those?',
];

enum colors {
  black = 0,
  red = 1,
  green = 2,
  yellow = 3,
  blue = 4,
  magenta = 5,
  cyan = 6,
  white = 7,
}

// fandom
export const FANDOM_LINKS: string_object<string> = {
  // Sword Art Online
  sao: 'swordartonline',
  // Accel World
  aw: 'accelworld',
  // The Irregular At Magic High School
  magichighschool: 'mahouka-koukou-no-rettousei',
  magichs: 'mahouka-koukou-no-rettousei',
  mahouka: 'mahouka-koukou-no-rettousei',
  irregular: 'mahouka-koukou-no-rettousei',
  // Re:Zero
  rezero: 'rezero',
  // Overlord
  overlord: 'overlordmaruyama',
  // Quintessential Quintuplets
  quintuplets: '5hanayome',
  '5toubun': '5hanayome',
  quints: '5hanayome',
  // Konosuba
  konosuba: 'konosuba',
  // A Certain Magical Index
  // A Certain Scientific Railgun
  index: 'toarumajutsunoindex',
  railgun: 'toarumajutsunoindex',
  cientificrailgun: 'toarumajutsunoindex',
  magicalindex: 'toarumajutsunoindex',
  //Steins;Gate
  'steins-gate': 'steins-gate',
  steinsgate: 'steins-gate',
  sg: 'steins-gate',
  // Fate series (Type Moon)
  fateseries: 'typemoon',
  fate: 'typemoon',
  // Fate Grand Order
  fgo: 'fategrandorder',
  arknights: 'mrfz',
};

// discord
enum opcodes {
  dispatch = 0,
  heartbeat = 1,
  identify = 2,
  presence_update = 3,
  voice_state_update = 4,
  resume = 6,
  reconnect = 7,
  request_guild_members = 8,
  invalid_session = 9,
  hello = 10,
  heartbeat_ack = 11,
}

enum activity_types {
  game = 0,
  streaming = 1,
  listening = 2,
  custom = 4,
  competing = 5,
}

enum activity_flags {
  instance = 1 << 0,
  join = 1 << 1,
  spectate = 1 << 2,
  join_request = 1 << 3,
  sync = 1 << 4,
  play = 1 << 5,
}

enum intents {
  guilds = 1 << 0,
  guild_members = 1 << 1,
  guild_bans = 1 << 2,
  guild_emojis = 1 << 3,
  guild_integrations = 1 << 4,
  guild_webhooks = 1 << 5,
  guild_invites = 1 << 6,
  guild_voice_states = 1 << 7,
  guild_presences = 1 << 8,
  guild_messages = 1 << 9,
  guild_message_reactions = 1 << 10,
  guild_message_typing = 1 << 11,
  direct_messages = 1 << 12,
  direct_message_reactions = 1 << 13,
  direct_message_typing = 1 << 14,
}

enum gateway_events {
  hello = 'HELLO', //defines the heartbeat interval
  ready = 'READY', //contains the initial state information
  resumed = 'RESUMED', //response to Resume
  reconnect = 'RECONNECT', //server is going away, client should reconnect to gateway and resume
  invalid_session = 'INVALID_SESSION', //failure response to Identify or Resume or invalid active session
  channel_create = 'CHANNEL_CREATE', //new guild channel created
  channel_update = 'CHANNEL_UPDATE', //channel was updated
  channel_delete = 'CHANNEL_DELETE', //channel was deleted
  channel_pins_update = 'CHANNEL_PINS_UPDATE', //message was pinned or unpinned
  guild_create = 'GUILD_CREATE', //lazy-load for unavailable guild, guild became available, or user joined a new guild
  guild_update = 'GUILD_UPDATE', //guild was updated
  guild_delete = 'GUILD_DELETE', //guild became unavailable, or user left/was removed from a guild
  guild_ban_add = 'GUILD_BAN_ADD', //user was banned from a guild
  guild_ban_remove = 'GUILD_BAN_REMOVE', //user was unbanned from a guild
  guild_emojis_update = 'GUILD_EMOJIS_UPDATE', //guild emojis were updated
  guild_integrations_update = 'GUILD_INTEGRATIONS_UPDATE', //guild integration was updated
  guild_member_add = 'GUILD_MEMBER_ADD', //new user joined a guild
  guild_member_remove = 'GUILD_MEMBER_REMOVE', //user was removed from a guild
  guild_member_update = 'GUILD_MEMBER_UPDATE', //guild member was updated
  guild_members_chunk = 'GUILD_MEMBERS_CHUNK', //response to Request Guild Members
  guild_role_create = 'GUILD_ROLE_CREATE', //guild role was created
  guild_role_update = 'GUILD_ROLE_UPDATE', //guild role was updated
  guild_role_delete = 'GUILD_ROLE_DELETE', //guild role was deleted
  invite_create = 'INVITE_CREATE', //invite to a channel was created
  invite_delete = 'INVITE_DELETE', //invite to a channel was deleted
  message_create = 'MESSAGE_CREATE', //message was created
  message_update = 'MESSAGE_UPDATE', //message was edited
  message_delete = 'MESSAGE_DELETE', //message was deleted
  message_delete_bulk = 'MESSAGE_DELETE_BULK', //multiple messages were deleted at once
  message_reaction_add = 'MESSAGE_REACTION_ADD', //user reacted to a message
  message_reaction_remove = 'MESSAGE_REACTION_REMOVE', //user removed a reaction from a message
  message_reaction_remove_all = 'MESSAGE_REACTION_REMOVE_ALL', //all reactions were explicitly removed from a message
  message_reaction_remove_emoji = 'MESSAGE_REACTION_REMOVE_EMOJI', //all reactions for a given emoji were explicitly removed from a message
  presence_update = 'PRESENCE_UPDATE', //user was updated
  typing_start = 'TYPING_START', //user started typing in a channel
  user_update = 'USER_UPDATE', //properties about the user changed
  voice_state_update = 'VOICE_STATE_UPDATE', //someone joined, left, or moved a voice channel
  voice_server_update = 'VOICE_SERVER_UPDATE', //guild's voice server was updated
  webhooks_update = 'WEBHOOKS_UPDATE', //guild channel webhook was created, update, or deleted
  interaction_create = 'INTERACTION_CREATE', //user used a Slash Command
}

enum application_command_option_type {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
}

enum interaction_response_type {
  pong = 1, // 	ACK a Ping
  // acknowledge = 2, // DEPRECATED ACK a command without sending a message, eating the user's input
  // channel_message = 3, // DEPRECATED respond with a message, eating the user's input
  channel_message_with_source = 4, // respond to an interaction with a message
  acknowledge_with_source = 5, // ACK an interaction and edit to a response later, the user sees a loading state
}

const no_mentions: discord.allowed_mentions = {
  parse: [],
  roles: [],
  users: [],
  replied_user: false,
};

export {
  colors,
  opcodes,
  activity_types,
  activity_flags,
  intents,
  gateway_events,
  application_command_option_type,
  interaction_response_type,
  no_mentions,
};

export const DISCORD_TOKEN_TTL = 15 * 60 * 1000; // 15 mins
