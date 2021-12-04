export type snowflake = string;
type integer = number;

/** [Get Gateway Bot](https://discord.com/developers/docs/topics/gateway#get-gateway-bot-json-response) */
export interface GatewayBot {
  /** The WSS URL that can be used for connecting to the gateway */
  url: string;
  /** The recommended number of shards to use when connecting */
  shards: integer;
  /** Information on the current session start limit */
  session_start_limit: SessionStartLimit;
}

/** [Session Start Limit](https://discord.com/developers/docs/topics/gateway#session-start-limit-object) */
export interface SessionStartLimit {
  /** The total number of session starts the current user is allowed */
  total: integer;
  /** The remaining number of session starts the current user is allowed */
  remaining: integer;
  /** The number of milliseconds after which the limit resets */
  reset_after: integer;
  /** The number of identify requests allowed per 5 seconds */
  max_concurrency: integer;
}

/** [Application Structure](https://discord.com/developers/docs/resources/application#application-object-application-structure) */
export interface Application {
  /** the id of the app */
  id: snowflake;
  /** the name of the app */
  name: string;
  /** the icon [hash](https://discord.com/developers/docs/reference#image-formatting) of the app */
  icon: string | null;
  /** the description of the app */
  description: string;
  /** an array of rpc origin urls, if rpc is enabled */
  rpc_origins?: string[];
  /** when false only app owner can join the app's bot to guilds */
  bot_public: boolean;
  /** when true the app's bot will only join upon completion of the full oauth2 code grant flow */
  bot_require_code_grant: boolean;
  /** the url of the app's terms of service */
  terms_of_service_url?: string;
  /** the url of the app's privacy policy */
  privacy_policy_url?: string;
  /** partial user object containing info on the owner of the application */
  owner?: Partial<User>;
  /** if this application is a game sold on Discord, this field will be the summary field for the store page of its primary sku */
  summary: string;
  /** the hex encoded key for verification in interactions and the GameSDK's [GetTicket](https://discord.com/developers/docs/game-sdk/applications#getticket) */
  verify_key: string;
  /** if the application belongs to a team, this will be a list of the members of that team */
  team: Team | null;
  /** if this application is a game sold on Discord, this field will be the guild to which it has been linked */
  guild_id?: snowflake;
  /** if this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists */
  primary_sku_id?: snowflake;
  /** if this application is a game sold on Discord, this field will be the URL slug that links to the store page */
  slug?: string;
  /** the application's default rich presence invite [cover image hash](https://discord.com/developers/docs/reference#image-formatting) */
  cover_image?: string;
  /** the application's public [flags](https://discord.com/developers/docs/resources/application#application-object-application-flags) */
  flags?: integer;
}

/** [User Structure](https://discord.com/developers/docs/resources/user#user-object) */
export interface User {
  /** the user's id */
  id: snowflake;
  /** the user's username, not unique across the platform */
  username: string;
  /** the user's 4-digit discord-tag */
  discriminator: string;
  /** the user's [avatar hash](https://discord.com/developers/docs/reference#image-formatting) */
  avatar: string | null;
  /** whether the user belongs to an OAuth2 application */
  bot?: boolean;
  /** whether the user is an Official Discord System user (part of the urgent message system) */
  system?: boolean;
  /** whether the user has two factor enabled on their account */
  mfa_enabled?: boolean;
  /** the user's [banner hash](https://discord.com/developers/docs/reference#image-formatting) */
  banner?: string | null;
  /** the user's banner color encoded as an integer representation of hexadecimal color code */
  accent_color?: integer | null;
  /** the user's chosen language option */
  locale?: string;
  /** whether the email on this account has been verified */
  verified?: boolean;
  /** the user's email */
  email?: string | null;
  /** the [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags) on a user's account */
  flags?: integer;
  /** the [type of Nitro subscription](https://discord.com/developers/docs/resources/user#user-object-premium-types) on a user's account */
  premium_type?: PremiumType;
  /** the public [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags) on a user's account */
  public_flags?: integer;
}

export enum UserFlags {
  /** None */
  None = 0,
  /** Discord Employee */
  STAFF = 1 << 0,
  /** Partnered Server Owner */
  PARTNER = 1 << 1,
  /** HypeSquad Events Coordinator */
  HYPESQUAD = 1 << 2,
  /** Bug Hunter Level 1 */
  BUG_HUNTER_LEVEL_1 = 1 << 3,
  /** House Bravery Member */
  HYPESQUAD_ONLINE_HOUSE_1 = 1 << 6,
  /** House Brilliance Member */
  HYPESQUAD_ONLINE_HOUSE_2 = 1 << 7,
  /** House Balance Member */
  HYPESQUAD_ONLINE_HOUSE_3 = 1 << 8,
  /** Early Nitro Supporter */
  PREMIUM_EARLY_SUPPORTER = 1 << 9,
  /** User is a team */
  TEAM_PSEUDO_USER = 1 << 10,
  /** Bug Hunter Level 2 */
  BUG_HUNTER_LEVEL_2 = 1 << 14,
  /** Verified Bot */
  VERIFIED_BOT = 1 << 16,
  /** Early Verified Bot Developer */
  VERIFIED_DEVELOPER = 1 << 17,
  /** Discord Certified Moderator */
  CERTIFIED_MODERATOR = 1 << 18,
  /** Bot uses only HTTP interactions and is shown in the online member list */
  BOT_HTTP_INTERACTIONS = 1 << 19,
}

/** [Premium Types](https://discord.com/developers/docs/resources/user#user-object-premium-types) */
export enum PremiumType {
  None = 0,
  NitroClassic = 1,
  Nitro = 2,
}

/** [Team Object](https://discord.com/developers/docs/game-sdk/applications#getticket) */
export interface Team {
  /** a hash of the image of the team's icon */
  icon: string | null;
  /** the unique id of the team */
  id: snowflake;
  /** the members of the team */
  members: TeamMember[];
  /** the name of the team */
  name: string;
  /** the user id of the current team owner */
  owner_user_id: snowflake;
}

/** [Team Member Object](https://discord.com/developers/docs/topics/teams#data-models-team-member-object) */
export interface TeamMember {
  /** the user's [membership state](https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum) on the team */
  membership_state: MembershipState;
  /** will always be ["*"] */
  permissions: string[];
  /** the id of the parent team of which they are a member */
  team_id: snowflake;
  /** the avatar, discriminator, id, and username of the user */
  user: Partial<User>;
}

/** [Membership State Enum](https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum) */
export enum MembershipState {
  INVITED = 1,
  ACCEPTED = 2,
}

// Channel
/** [Channel Structure](https://discord.com/developers/docs/resources/channel#channel-object-channel-structure) */
export interface Channel {
  /** the id of this channel */
  id: snowflake;
  /** the [type of channel](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) */
  type: ChannelTypes;
  /** the id of the guild (may be missing for some channel objects received over gateway guild dispatches) */
  guild_id?: snowflake;
  /** sorting position of the channel */
  position?: integer;
  /** explicit permission overwrites for members and roles */
  permission_overwrites?: Overwrite[];
  /** the name of the channel (1-100 characters) */
  name?: string;
  /** the channel topic (0-1024 characters) */
  topic?: string | null;
  /** whether the channel is nsfw */
  nsfw?: boolean;
  /** the id of the last message sent in this channel (may not point to an existing or valid message) */
  last_message_id?: snowflake | null;
  /** the bitrate (in bits) of the voice channel */
  bitrate?: integer;
  /** the user limit of the voice channel */
  user_limit?: integer;
  /** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
  rate_limit_per_user?: integer;
  /** the recipients of the DM */
  recipients?: User[];
  /** icon hash */
  icon?: string | null;
  /** id of the creator of the group DM or thread */
  owner_id?: snowflake;
  /** application id of the group DM creator if it is bot-created */
  application_id?: snowflake;
  /** for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created */
  parent_id?: snowflake | null;
  /** when the last pinned message was pinned. This may be null in events such as GUILD_CREATE when a message is not pinned. */
  last_pin_timestamp?: string | null;
  /** [voice region](https://discord.com/developers/docs/resources/voice#voice-region-object) id for the voice channel, automatic when set to null */
  rtc_region?: VoiceRegion | null;
  /** the camera [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) of the voice channel, 1 when not present */
  video_quality_mode?: VideoQualityMode;
  /** an approximate count of messages in a thread, stops counting at 50 */
  message_count?: integer;
  /** an approximate count of users in a thread, stops counting at 50 */
  member_count?: integer;
  /** thread-specific fields not needed by other channels */
  thread_metadata?: ThreadMetadata;
  /** thread member object for the current user, if they have joined the thread, only included on certain API endpoints */
  member?: ThreadMember;
  /** default duration that the clients (not the API) will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  default_auto_archive_duration?: integer;
  /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
  permissions?: string;
}

/** [Channel Types](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) */
export enum ChannelTypes {
  /** a text channel within a server */
  GUILD_TEXT = 0,
  /** a direct message between users */
  DM = 1,
  /** a voice channel within a server */
  GUILD_VOICE = 2,
  /** a direct message between multiple users */
  GROUP_DM = 3,
  /** an [organizational category](https://support.discord.com/hc/en-us/articles/115001580171-Channel-Categories-101) that contains up to 50 channels */
  GUILD_CATEGORY = 4,
  /** a channel that [users can follow and crosspost into their own server](https://support.discord.com/hc/en-us/articles/360032008192) */
  GUILD_NEWS = 5,
  /** a channel in which game developers can [sell their game on Discord](https://discord.com/developers/docs/game-and-server-management/special-channels) */
  GUILD_STORE = 6,
  /** a temporary sub-channel within a GUILD_NEWS channel */
  GUILD_NEWS_THREAD = 10,
  /** a temporary sub-channel within a GUILD_TEXT channel */
  GUILD_PUBLIC_THREAD = 11,
  /** a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission */
  GUILD_PRIVATE_THREAD = 12,
  /** a voice channel for [hosting events with an audience](https://support.discord.com/hc/en-us/articles/1500005513722) */
  GUILD_STAGE_VOICE = 13,
}

/** [Overwrite Structure](https://discord.com/developers/docs/resources/channel#overwrite-object) */
export interface Overwrite {
  /** role or user id */
  id: snowflake;
  /** either 0 (role) or 1 (member) */
  type: OverwriteType;
  /** permission bit set */
  allow: string;
  /** permission bit set */
  deny: string;
}

export enum OverwriteType {
  ROLE = 0,
  USER = 1,
}

/** [Voice Region Structure](https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure) */
export interface VoiceRegion {
  /** unique ID for the region */
  id: string;
  /** name of the region */
  name: string;
  /** true for a single server that is closest to the current user's client */
  optimal: boolean;
  /** whether this is a deprecated voice region (avoid switching to these) */
  deprecated: boolean;
  /** whether this is a custom voice region (used for events/etc) */
  custom: boolean;
}

/** [Video Quality Mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) */
export enum VideoQualityMode {
  /** Discord chooses the quality for optimal performance */
  AUTO = 1,
  /** 720p */
  FULL = 2,
}

/** [Thread Metadata Structure](https://discord.com/developers/docs/resources/channel#thread-metadata-object) */
export interface ThreadMetadata {
  /** whether the thread is archived */
  archived: boolean;
  /** duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080 */
  auto_archive_duration: integer;
  /** timestamp when the thread's archive status was last changed, used for calculating recent activity */
  archive_timestamp: string;
  /** whether the thread is locked; when a thread is locked, only users with MANAGE_THREADS can unarchive it */
  locked: boolean;
  /** whether non-moderators can add other non-moderators to a thread; only available on private threads */
  invitable?: boolean;
}

/** [Thread Member Structure](https://discord.com/developers/docs/resources/channel#thread-member-object) */
export interface ThreadMember {
  /** the id of the thread */
  id?: snowflake;
  /** the id of the user */
  user_id?: snowflake;
  /** the time the current user last joined the thread */
  join_timestamp: string;
  /** any user-thread settings, currently only used for notifications */
  flags: integer;
}

/** [Edit Webhook Message](https://discord.com/developers/docs/resources/webhook#edit-webhook-message) */
export interface EditWebhookMessage {
  /** the message contents (up to 2000 characters) */
  content?: string | null;
  /** embedded rich content */
  embeds?: Embed[] | null;
  /** allowed mentions for the message */
  allowed_mentions?: AllowedMentions | null;
  /** the components to include with the message */
  components?: Component[] | null;
  /** attached files to keep and possible descriptions for new files */
  attachments?: Partial<Attachment>[] | null;
}

export enum MessageFlags {
  /** this message has been published to subscribed channels (via Channel Following) */
  CROSSPOSTED = 1 << 0,
  /** this message originated from a message in another channel (via Channel Following) */
  IS_CROSSPOST = 1 << 1,
  /** do not include any embeds when serializing this message */
  SUPPRESS_EMBEDS = 1 << 2,
  /** the source message for this crosspost has been deleted (via Channel Following) */
  SOURCE_MESSAGE_DELETED = 1 << 3,
  /** this message came from the urgent message system */
  URGENT = 1 << 4,
  /** this message has an associated thread, with the same id as the message */
  HAS_THREAD = 1 << 5,
  /** this message is only visible to the user who invoked the Interaction */
  EPHEMERAL = 1 << 6,
  /** this message is an Interaction Response and the bot is "thinking" */
  LOADING = 1 << 7,
}

/** [Edit Message](https://discord.com/developers/docs/resources/channel#edit-message) */
export interface EditMessage {
  /** the message contents (up to 2000 characters) */
  content?: string | null;
  /** embedded rich content (up to 6000 characters) */
  embeds?: Embed[] | null;
  /** edit the flags of a message (only SUPPRESS_EMBEDS can currently be set/unset) */
  flags?: integer | null;
  /** allowed mentions for the message */
  allowed_mentions?: AllowedMentions | null;
  /** the components to include with the message */
  components?: Component[] | null;
  /** attached files to keep and possible descriptions for new files */
  attachments?: Attachment[] | null;
}

/** [Create Message](https://discord.com/developers/docs/resources/channel#create-message) */
export interface CreateMessage {
  /** the message contents (up to 2000 characters) */
  content?: string;
  /** true if this is a TTS message */
  tts?: boolean;
  /** embedded rich content (up to 6000 characters) */
  embeds?: Embed[] | null;
  /** allowed mentions for the message */
  allowed_mentions?: AllowedMentions | null;
  /** include to make your message a reply */
  message_reference?: MessageReference | null;
  /** the components to include with the message */
  components?: Component[] | null;
  /** IDs of up to 3 stickers in the server to send in the message */
  sticker_ids?: snowflake[] | null;
  /** attachment objects with filename and description */
  attachments?: Partial<Attachment> | null;
}
/** [Message Structure](https://discord.com/developers/docs/resources/channel#message-object) */
export interface Message {
  /** id of the message */
  id: snowflake;
  /** id of the channel the message was sent in */
  channel_id: snowflake;
  /** id of the guild the message was sent in */
  guild_id?: snowflake;
  /** the author of this message (not guaranteed to be a valid user, see below) */
  author: User;
  /** member properties for this message's author */
  member?: Partial<GuildMember>;
  /** contents of the message */
  content: string;
  /** when this message was sent */
  timestamp: string;
  /** when this message was edited (or null if never) */
  edited_timestamp: string | null;
  /** whether this was a TTS message */
  tts: boolean;
  /** whether this message mentions everyone */
  mention_everyone: boolean;
  /** users specifically mentioned in the message */
  mentions: (User & Partial<GuildMember>)[];
  /** roles specifically mentioned in this message */
  mention_roles: string[];
  /** channels specifically mentioned in this message */
  mention_channels?: ChannelMention[];
  /** any attached files */
  attachments: Attachment[];
  /** any embedded content */
  embeds: Embed[];
  /** reactions to the message */
  reactions?: Reaction[];
  /** used for validating a message was sent */
  nonce?: integer | string;
  /** whether this message is pinned */
  pinned: boolean;
  /** if the message is generated by a webhook, this is the webhook's id */
  webhook_id?: snowflake;
  /** [type of message](https://discord.com/developers/docs/resources/channel#message-object-message-types) */
  type: MessageType;
  /** sent with Rich Presence-related chat embeds */
  activity?: MessageActivity;
  /** sent with Rich Presence-related chat embeds */
  application?: Partial<Application>;
  /** if the message is a response to an [Interaction](https://discord.com/developers/docs/interactions/receiving-and-responding), this is the id of the interaction's application */
  application_id?: snowflake;
  /** data showing the source of a crosspost, channel follow add, pin, or reply message */
  message_reference?: MessageReference;
  /** [message flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) combined as a [bitfield](https://en.wikipedia.org/wiki/Bit_field) */
  flags?: integer;
  /** the message associated with the message_reference */
  referenced_message?: Message | null;
  /** sent if the message is a response to an [Interaction](https://discord.com/developers/docs/interactions/receiving-and-responding) */
  interaction?: MessageInteraction;
  /** the thread that was started from this message, includes [thread member](https://discord.com/developers/docs/resources/channel#thread-member-object) object */
  thread?: Channel;
  /** sent if the message contains components like buttons, action rows, or other interactive components */
  components?: Component[];
  /** sent if the message contains stickers */
  sticker_items?: StickerItem[];
  /** Deprecated the stickers sent with the message */
  stickers?: Sticker[];
}

/** [Guild Member Structure](https://discord.com/developers/docs/resources/guild#guild-member-object) */
export interface GuildMember {
  /** the user this guild member represents */
  user?: User;
  /** this users guild nickname */
  nick?: string | null;
  /** the member's [guild avatar hash](https://discord.com/developers/docs/reference#image-formatting) */
  avatar?: string | null;
  /** array of [role](https://discord.com/developers/docs/topics/permissions#role-object) object ids */
  roles: snowflake[];
  /** when the user joined the guild */
  joined_at: string;
  /** when the user started [boosting](https://support.discord.com/hc/en-us/articles/360028038352-Server-Boosting-) the guild */
  premium_since?: string | null;
  /** whether the user is deafened in voice channels */
  deaf: boolean;
  /** whether the user is muted in voice channels */
  mute: boolean;
  /** whether the user has not yet passed the guild's [Membership Screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) requirements */
  pending?: boolean;
  /** total permissions of the member in the channel, including overwrites, returned when in the interaction object */
  permissions?: string;
}

/** [Channel Mention Structure](https://discord.com/developers/docs/resources/channel#channel-mention-object) */
export interface ChannelMention {
  /** id of the channel */
  id: snowflake;
  /** id of the guild containing the channel */
  guild_id: snowflake;
  /** the type of channel */
  type: ChannelTypes;
  /** the name of the channel */
  name: string;
}

/** [Attachment Structure](https://discord.com/developers/docs/resources/channel#attachment-object) */
export interface Attachment {
  /** attachment id */
  id: snowflake;
  /** name of file attached */
  filename: string;
  /** description for the file */
  description?: string;
  /** the attachment's [media type](https://en.wikipedia.org/wiki/Media_type) */
  content_type?: string;
  /** size of file in bytes */
  size: integer;
  /** source url of file */
  url: string;
  /** a proxied url of file */
  proxy_url: string;
  /** height of file (if image) */
  height?: integer | null;
  /** width of file (if image) */
  width?: integer | null;
  /** whether this attachment is ephemeral */
  ephemeral?: boolean;
}

/** [Embed Structure](https://discord.com/developers/docs/resources/channel#embed-object) */
export interface Embed {
  /** title of embed */
  title?: string;
  /** type of embed (always "rich" for webhook embeds) */
  type?: EmbedType;
  /** description of embed */
  description?: string;
  /** url of embed */
  url?: string;
  /** timestamp of embed content */
  timestamp?: string;
  /** color code of the embed */
  color?: integer;
  /** footer information */
  footer?: EmbedFooter;
  /** image information */
  image?: EmbedImage;
  /** thumbnail information */
  thumbnail?: EmbedThumbnail;
  /** video information */
  video?: EmbedVideo;
  /** provider information */
  provider?: EmbedProvider;
  /** author information */
  author?: EmbedAuthor;
  /** fields information */
  fields?: EmbedField[];
}

/** [Embed Types](https://discord.com/developers/docs/resources/channel#embed-object-embed-types) */
export enum EmbedType {
  /** generic embed rendered from embed attributes */
  Rich = "rich",
  /** image embed */
  Image = "image",
  /** video embed */
  Video = "video",
  /** animated gif image embed rendered as a video embed */
  Gifv = "gifv",
  /** article embed */
  Article = "article",
  /** link embed */
  Link = "link",
}

/** [Embed Footer Structure](https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-object) */
export interface EmbedFooter {
  /** footer text */
  text: string;
  /** url of footer icon (only supports http(s) and attachments) */
  icon_url?: string;
  /** a proxied url of footer icon */
  proxy_icon_url?: string;
}

/** [Embed Image Structure](https://discord.com/developers/docs/resources/channel#embed-object-embed-image-object) */
export interface EmbedImage {
  /** source url of image (only supports http(s) and attachments) */
  url: string;
  /** a proxied url of the image */
  proxy_url?: string;
  /** height of image */
  height?: integer;
  /** width of image */
  width?: integer;
}

/** [Embed Thumbnail Structure](https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-object) */
export interface EmbedThumbnail {
  /** source url of thumbnail (only supports http(s) and attachments) */
  url: string;
  /** a proxied url of the thumbnail */
  proxy_url?: string;
  /** height of thumbnail */
  height?: integer;
  /** width of thumbnail */
  width?: integer;
}

/** [Embed Video Structure](https://discord.com/developers/docs/resources/channel#embed-object-embed-video-object) */
export interface EmbedVideo {
  /** source url of video */
  url?: string;
  /** a proxied url of the video */
  proxy_url?: string;
  /** height of video */
  height?: integer;
  /** width of video */
  width?: integer;
}

/** [Embed Provider Structure](https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-object) */
export interface EmbedProvider {
  /** name of provider */
  name?: string;
  /** url of provider */
  url?: string;
}

/** [Embed Author Structure](https://discord.com/developers/docs/resources/channel#embed-object-embed-author-object) */
export interface EmbedAuthor {
  /** name of author */
  name: string;
  /** url of author */
  url?: string;
  /** url of author icon (only supports http(s) and attachments) */
  icon_url?: string;
  /** a proxied url of author icon */
  proxy_icon_url?: string;
}

/** [Embed Field Structure](https://discord.com/developers/docs/resources/channel#embed-object-embed-field-object) */
export interface EmbedField {
  /** name of the field */
  name: string;
  /** value of the field */
  value: string;
  /** whether or not this field should display inline */
  inline?: boolean;
}

/** [Reaction Structure](https://discord.com/developers/docs/resources/channel#reaction-object) */
export interface Reaction {
  /** times this emoji has been used to react */
  count: integer;
  /** whether the current user reacted using this emoji */
  me: boolean;
  /** emoji information */
  emoji: Partial<Emoji>;
}

/** [Emoji Structure](https://discord.com/developers/docs/resources/emoji#emoji-object) */
export interface Emoji {
  /** [emoji id](https://discord.com/developers/docs/reference#image-formatting) */
  id: snowflake | null;
  /** emoji name */
  name: string | null;
  /** roles allowed to use this emoji */
  roles?: snowflake[];
  /** user that created this emoji */
  user?: User;
  /** whether this emoji must be wrapped in colons */
  require_colons?: boolean;
  /** whether this emoji is managed */
  managed?: boolean;
  /** whether this emoji is animated */
  animated?: boolean;
  /** whether this emoji can be used, may be false due to loss of Server Boosts */
  available?: boolean;
}

/** [Message Types](https://discord.com/developers/docs/resources/channel#message-object-message-types) */
export enum MessageType {
  DEFAULT = 0,
  RECIPIENT_ADD = 1,
  RECIPIENT_REMOVE = 2,
  CALL = 3,
  CHANNEL_NAME_CHANGE = 4,
  CHANNEL_ICON_CHANGE = 5,
  CHANNEL_PINNED_MESSAGE = 6,
  GUILD_MEMBER_JOIN = 7,
  USER_PREMIUM_GUILD_SUBSCRIPTION = 8,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1 = 9,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2 = 10,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3 = 11,
  CHANNEL_FOLLOW_ADD = 12,
  GUILD_DISCOVERY_DISQUALIFIED = 14,
  GUILD_DISCOVERY_REQUALIFIED = 15,
  GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING = 16,
  GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING = 17,
  THREAD_CREATED = 18,
  REPLY = 19,
  CHAT_INPUT_COMMAND = 20,
  THREAD_STARTER_MESSAGE = 21,
  GUILD_INVITE_REMINDER = 22,
  CONTEXT_MENU_COMMAND = 23,
}

/** [Message Activity Structure](https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure) */
export interface MessageActivity {
  /** type of message activity */
  type: MessageActivityType;
  /** party_id from a Rich Presence event */
  party_id?: string;
}

/** [Message Activity Types](https://discord.com/developers/docs/resources/channel#message-object-message-activity-types) */
export enum MessageActivityType {
  JOIN = 1,
  SPECTATE = 2,
  LISTEN = 3,
  JOIN_REQUEST = 5,
}

/** [Message Reference Structure](https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure) */
export interface MessageReference {
  /** id of the originating message */
  message_id?: snowflake;
  /** id of the originating message's channel */
  channel_id?: snowflake;
  /** id of the originating message's guild */
  guild_id?: snowflake;
  /** when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true */
  fail_if_not_exists?: boolean;
}

/** [Message Interaction Structure](https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure) */
export interface MessageInteraction {
  /** id of the interaction */
  id: snowflake;
  /** the type of interaction */
  type: InteractionType;
  /** the name of the [application command](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure) */
  name: string;
  /** the user who invoked the interaction */
  user: User;
}

/** [Interaction Types](https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-interaction-types) */
export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
}

/** [Component Structure](https://discord.com/developers/docs/interactions/message-components#component-object) */
export type Component = Button | SelectMenu | ActionRow;

/** [Component Types](https://discord.com/developers/docs/interactions/message-components#component-object-component-types) */
export enum ComponentType {
  /** A container for other components */
  ActionRow = 1,
  /** A button object */
  Button = 2,
  /** A select menu for picking from choices */
  SelectMenu = 3,
}

/** [Button Structure](https://discord.com/developers/docs/interactions/message-components#button-object) */
export interface Button {
  /** 2 for a button */
  type: ComponentType.Button;
  /** one of button styles */
  style: ButtonStyle;
  /** text that appears on the button, max 80 characters */
  label?: string;
  /** name, id, and animated */
  emoji?: Emoji;
  /** a developer-defined identifier for the button, max 100 characters */
  custom_id?: string;
  /** a url for link-style buttons */
  url?: string;
  /** whether the button is disabled (default false) */
  disabled?: boolean;
}

/** [Button Styles](https://discord.com/developers/docs/interactions/message-components#button-object-button-styles) */
export enum ButtonStyle {
  /** blurple */
  Primary = 1,
  /** grey */
  Secondary = 2,
  /** green  */
  Success = 3,
  /** red */
  Danger = 4,
  /** grey, navigates to a URL */
  Link = 5,
}

/** [Select Menu Structure](https://discord.com/developers/docs/interactions/message-components#select-menu-object) */
export interface SelectMenu {
  /** 3 for a select menu */
  type: ComponentType.SelectMenu;
  /** a developer-defined identifier for the button, max 100 characters */
  custom_id: string;
  /** the choices in the select, max 25 */
  options: SelectOption[];
  /** custom placeholder text if nothing is selected, max 100 characters */
  placeholder?: string;
  /** the minimum number of items that must be chosen; default 1, min 0, max 25 */
  min_values?: integer;
  /** the maximum number of items that can be chosen; default 1, max 25 */
  max_values?: integer;
  /** disable the select, default false */
  disabled?: boolean;
}

/** [Select Option Structure](https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure) */
export interface SelectOption {
  /** the user-facing name of the option, max 100 characters */
  label: string;
  /** the dev-define value of the option, max 100 characters */
  value: string;
  /** an additional description of the option, max 100 characters */
  description?: string;
  /** id, name, and animated */
  emoji?: Partial<Emoji>;
  /** will render this option as selected by default */
  default?: boolean;
}

export interface ActionRow {
  type: ComponentType.ActionRow;
  components: Component[];
}
/** [Sticker Item Structure](https://discord.com/developers/docs/resources/sticker#sticker-item-object) */
export interface StickerItem {
  /** id of the sticker */
  id: snowflake;
  /** name of the sticker */
  name: string;
  /** type of sticker format */
  format_type: StickerFormatType;
}

/** [Sticker Format Types](https://discord.com/developers/docs/resources/sticker#sticker-item-object-format-types) */
export enum StickerFormatType {
  PNG = 1,
  APNG = 2,
  LOTTIE = 3,
}

/** [Sticker Object](https://discord.com/developers/docs/resources/sticker#sticker-object) */
export interface Sticker {
  /** [id of the sticker](https://discord.com/developers/docs/reference#image-formatting) */
  id: snowflake;
  /** for standard stickers, id of the pack the sticker is from */
  pack_id?: snowflake;
  /** name of the sticker */
  name: string;
  /** description of the sticker */
  description: string | null;
  /** autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: string;
  /** @deprecated previously the sticker asset hash, now an empty string */
  asset: "";
  /** type of sticker */
  type: StickerType;
  /** type of sticker format */
  format_type: StickerFormatType;
  /** whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available?: boolean;
  /** id of the guild that owns this sticker */
  guild_id?: snowflake;
  /** the user that uploaded the guild sticker */
  user?: User;
  /** the standard sticker's sort order within its pack */
  sort_value?: integer;
}

/** [Sticker Types](https://discord.com/developers/docs/resources/sticker#sticker-object-types) */
export enum StickerType {
  /** an official sticker in a pack, part of Nitro or in a removed purchasable pack */
  STANDARD = 1,
  /** a sticker uploaded to a Boosted guild for the guild's members */
  GUILD = 2,
}

/** [Interaction Structure](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object) */
export interface Interaction {
  /** id of the interaction */
  id: snowflake;
  /** id of the application this interaction is for */
  application_id: snowflake;
  /** the type of interaction */
  type: InteractionType;
  /** the command data payload */
  data?: InteractionData;
  /** the guild it was sent from */
  guild_id?: snowflake;
  /** the channel it was sent from */
  channel_id?: snowflake;
  /** guild member data for the invoking user, including permissions */
  member?: GuildMember;
  /** user object for the invoking user, if invoked in a DM */
  user?: User;
  /** a continuation token for responding to the interaction */
  token: string;
  /** read-only property, always 1 */
  version: integer;
  /** for components, the message they were attached to */
  message?: Message;
}

/** [Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object) */
export interface InteractionResponse {
  /** the type of response */
  type: InteractionCallbackType;
  /** an optional response message */
  data?: InteractionCallbackData;
}

/** [Interaction Callback Type](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type) */
export enum InteractionCallbackType {
  /** ACK a Ping */
  PONG = 1,
  /** respond to an interaction with a message */
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  /** ACK an interaction and edit a response later, the user sees a loading state */
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  /** for components, ACK an interaction and edit the original message later; the user does not see a loading state */
  DEFERRED_UPDATE_MESSAGE = 6,
  /** for components, edit the message the component was attached to */
  UPDATE_MESSAGE = 7,
  /** respond to an autocomplete interaction with suggested choices */
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
}

export enum InteractionCallbackDataFlags {
  /** only the user receiving the message can see it */
  EPHEMERAL = 1 << 6,
}

/** [Interaction Callback Data](https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction) */
export interface InteractionCallbackData {
  /** is the response TTS */
  tts?: boolean;
  /** message content */
  content?: string;
  /** supports up to 10 embeds */
  embeds?: Embed[];
  /** allowed mentions object */
  allowed_mentions?: AllowedMentions;
  /** interaction callback data flags */
  flags?: integer;
  /** message components */
  components?: Component[];
  /** attachment objects with filename and description */
  attachments?: Partial<Attachment>[];
}

/** [Application Command Structure](https://discord.com/developers/docs/resources/application#application-command-object) */
export interface ApplicationCommand {
  /** unique id of the command */
  id: snowflake;
  /** the type of command, defaults 1 if not set */
  type?: ApplicationCommandType;
  /** unique id of the parent application */
  application_id: snowflake;
  /** guild id of the command, if not global */
  guild_id?: snowflake;
  /** 1-32 character name */
  name: string;
  /** 1-100 character description for CHAT_INPUT commands, empty string for USER and MESSAGE commands */
  description: string;
  /** the parameters for the command, max 25 */
  options?: ApplicationCommandOption[];
  /** whether the command is enabled by default when the app is added to a guild
   * @defaultValue true
   */
  default_permission?: boolean;
  /** autoincrementing version identifier updated during substantial record changes */
  version: snowflake;
}

/** [Create Global Command](https://discord.com/developers/docs/interactions/application-commands#create-global-application-command) */
export interface CreateGlobalApplicationCommand {
  /** 1-32 character name */
  name: string;
  /** 1-100 character description */
  description: string;
  /** the parameters for the command */
  options?: ApplicationCommandOption[];
  /** whether the command is enabled by default when the app is added to a guild */
  default_permission?: boolean;
  /** the type of command, defaults 1 if not set */
  type?: ApplicationCommandType;
}

/** [Application Command Option](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure) */
export interface ApplicationCommandOption {
  /** the type of option */
  type: ApplicationCommandOptionType;
  /** 1-32 character name */
  name: string;
  /** 1-100 character description */
  description: string;
  /** if the parameter is required or optional--default false */
  required?: boolean;
  /** choices for STRING, INTEGER, and NUMBER types for the user to pick from, max 25 */
  choices?: ApplicationCommandOptionChoice[];
  /** if the option is a subcommand or subcommand group type, these nested options will be the parameters */
  options?: ApplicationCommandOption[];
  /** if the option is a channel type, the channels shown will be restricted to these types */
  channel_types?: ChannelType[];
  /** if the option is an INTEGER or NUMBER type, the minimum value permitted */
  min_value?: number;
  /** if the option is an INTEGER or NUMBER type, the maximum value permitted */
  max_value?: number;
  /** enable autocomplete interactions for this option */
  autocomplete?: boolean;
}

/** [Application Command Option Choice](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure) */
export interface ApplicationCommandOptionChoice {
  /** 1-100 character choice name */
  name: string;
  /** value of the choice, up to 100 characters if string */
  value: string | integer | boolean;
}

/** [Channel Types](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) */
export enum ChannelType {
  /** a text channel within a server */
  GUILD_TEXT = 0,
  /** a direct message between users */
  DM = 1,
  /** a voice channel within a server */
  GUILD_VOICE = 2,
  /** a direct message between multiple users */
  GROUP_DM = 3,
  /** an organizational category that contains up to 50 channels */
  GUILD_CATEGORY = 4,
  /** a channel that users can follow and crosspost into their own server */
  GUILD_NEWS = 5,
  /** a channel in which game developers can sell their game on Discord */
  GUILD_STORE = 6,
  /** a temporary sub-channel within a GUILD_NEWS channel */
  GUILD_NEWS_THREAD = 10,
  /** a temporary sub-channel within a GUILD_TEXT channel */
  GUILD_PUBLIC_THREAD = 11,
  /** a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission */
  GUILD_PRIVATE_THREAD = 12,
  /** a voice channel for hosting events with an audience */
  GUILD_STAGE_VOICE = 13,
}

/** [Interaction Data Structure](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data-structure) */
export interface InteractionData {
  /** the [ID](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure) of the invoked command */
  id: snowflake;
  /** the [name](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure) of the invoked command */
  name: string;
  /** the [type](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure) of the invoked command */
  type: ApplicationCommandType;
  /** converted users + roles + channels */
  resolved?: ResolvedData;
  /** the params + values from the user */
  options?: CommandInteractionDataOption[];
  /** the custom_id of the component */
  custom_id?: string;
  /** the type of the component */
  component_type?: integer;
  /** the values the user selected */
  values?: SelectOption[];
  /** id the of user or message targetted by a [user](https://discord.com/developers/docs/interactions/application-commands#user-commands) or [message](https://discord.com/developers/docs/interactions/application-commands#message-commands) command */
  target_id?: snowflake;
}

/** [Application Command Types](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types) */
export enum ApplicationCommandType {
  /** Slash commands; a text-based command that shows up when a user types / */
  CHAT_INPUT = 1,
  /** A UI-based command that shows up when you right click or tap on a user */
  USER = 2,
  /** A UI-based command that shows up when you right click or tap on a message */
  MESSAGE = 3,
}

/** [Resolved Data Structure](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure) */
export interface ResolvedData {
  /** the ids and User objects */
  users?: Map<snowflake, User>;
  /** the ids and partial Member objects */
  members?: Map<snowflake, Partial<GuildMember>>;
  /** the ids and Role objects */
  roles?: Map<snowflake, Role>;
  /** the ids and partial Channel objects */
  channels?: Map<snowflake, Partial<Channel>>;
  /** the ids and partial Message objects */
  messages?: Map<snowflake, Partial<Message>>;
}

/** [Role Structure](https://discord.com/developers/docs/topics/permissions#role-object) */
export interface Role {
  /** role id */
  id: snowflake;
  /** role name */
  name: string;
  /** integer representation of hexadecimal color code */
  color: integer;
  /** if this role is pinned in the user listing */
  hoist: boolean;
  /** role [icon hash](https://discord.com/developers/docs/reference#image-formatting) */
  icon?: string | null;
  /** role unicode emoji */
  unicode_emoji?: string | null;
  /** position of this role */
  position: integer;
  /** permission bit set */
  permissions: string;
  /** whether this role is managed by an integration */
  managed: boolean;
  /** whether this role is mentionable */
  mentionable: boolean;
  /** the tags this role has */
  tags?: RoleTags;
}

/** [Role Tags Structure](https://discord.com/developers/docs/topics/permissions#role-object-tags) */
export interface RoleTags {
  /** the id of the bot this role belongs to */
  bot_id?: snowflake;
  /** the id of the integration this role belongs to */
  integration_id?: snowflake;
  /** whether this is the guild's premium subscriber role */
  premium_subscriber?: null;
}

/** [Command Interaction Data Option Structure](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-interaction-data-option-structure) */
export interface CommandInteractionDataOption {
  /** the name of the parameter */
  name: string;
  /** value of [application command option type](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type) */
  type: ApplicationCommandOptionType;
  /** the value of the pair */
  value?: boolean | string | number;
  /** present if this option is a group or subcommand */
  options?: CommandInteractionDataOption[];
  /** true if this option is the currently focused option for autocomplete */
  focused?: boolean;
}

/** [Application Command Option Type](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type) */
export enum ApplicationCommandOptionType {
  /**  */
  SUB_COMMAND = 1,
  /**  */
  SUB_COMMAND_GROUP = 2,
  /**  */
  STRING = 3,
  /** Any integer between -2^53 and 2^53 */
  INTEGER = 4,
  /**  */
  BOOLEAN = 5,
  /**  */
  USER = 6,
  /** Includes all channel types + categories */
  CHANNEL = 7,
  /**  */
  ROLE = 8,
  /** Includes users and roles */
  MENTIONABLE = 9,
  /** Any double between -2^53 and 2^53 */
  NUMBER = 10,
}

/** [Message Reaction Add Structure](https://discord.com/developers/docs/topics/gateway#message-reaction-add) */
export interface MessageReactionAdd {
  /** the id of the user */
  user_id: snowflake;
  /** the id of the channel */
  channel_id: snowflake;
  /** the id of the message */
  message_id: snowflake;
  /** the id of the guild */
  guild_id?: snowflake;
  /** the member who reacted if this happened in a guild */
  member?: GuildMember;
  /** the emoji used to react - [example](https://discord.com/developers/docs/resources/emoji#emoji-object-gateway-reaction-standard-emoji-example) */
  emoji: Partial<Emoji>;
}

/** [Message Reaction Remove Structure](https://discord.com/developers/docs/topics/gateway#message-reaction-remove) */
export interface MessageReactionRemove {
  /** the id of the user */
  user_id: snowflake;
  /** the id of the channel */
  channel_id: snowflake;
  /** the id of the message */
  message_id: snowflake;
  /** the id of the guild */
  guild_id?: snowflake;
  /** the emoji used to react - [example](https://discord.com/developers/docs/resources/emoji#emoji-object-gateway-reaction-standard-emoji-example) */
  emoji: Partial<Emoji>;
}

/** [Guild Structure](https://discord.com/developers/docs/resources/guild#guild-object) */
export interface Guild {
  /** guild id */
  id: snowflake;
  /** guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: string;
  /** [icon hash](https://discord.com/developers/docs/reference#image-formatting) */
  icon: string | null;
  /** [icon hash](https://discord.com/developers/docs/reference#image-formatting), returned when in the template object */
  icon_hash?: string | null;
  /** [splash hash](https://discord.com/developers/docs/reference#image-formatting) */
  splash: string | null;
  /** [discovery splash hash](https://discord.com/developers/docs/reference#image-formatting); only present for guilds with the "DISCOVERABLE" feature */
  discovery_splash: string | null;
  /** true if [the user](https://discord.com/developers/docs/resources/user#get-current-user-guilds) is the owner of the guild */
  owner?: boolean;
  /** id of owner */
  owner_id: snowflake;
  /** total permissions for [the user](https://discord.com/developers/docs/resources/user#get-current-user-guilds) in the guild (excludes overwrites) */
  permissions?: string;
  /** @deprecated voice region id for the guild (deprecated) */
  region?: VoiceRegion | null;
  /** id of afk channel */
  afk_channel_id: snowflake | null;
  /** afk timeout in seconds */
  afk_timeout: integer;
  /** true if the server widget is enabled */
  widget_enabled?: boolean;
  /** the channel id that the widget will generate an invite to, or null if set to no invite */
  widget_channel_id?: snowflake | null;
  /** [verification level](https://discord.com/developers/docs/resources/guild#guild-object-verification-level) required for the guild */
  verification_level: VerificationLevel;
  /** default [message notifications level](https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level) */
  default_message_notifications: NotificationLevel;
  /** [explicit content filter level](https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level) */
  explicit_content_filter: ExplicitContentFilterLevel;
  /** roles in the guild */
  roles: Role[];
  /** custom guild emojis */
  emojis: Emoji[];
  /** enabled guild features */
  features: GuildFeature[];
  /** required MFA level for the guild */
  mfa_level: MfaLevel;
  /** application id of the guild creator if it is bot-created */
  application_id: snowflake | null;
  /** the id of the channel where guild notices such as welcome messages and boost events are posted */
  system_channel_id: snowflake | null;
  /** system channel flags */
  system_channel_flags: integer;
  /** the id of the channel where Community guilds can display rules and/or guidelines */
  rules_channel_id: snowflake | null;
  /** when this guild was joined at */
  joined_at?: string;
  /** true if this is considered a large guild */
  large?: boolean;
  /** true if this guild is unavailable due to an outage */
  unavailable?: boolean;
  /** total number of members in this guild */
  member_count?: integer;
  /** states of members currently in voice channels; lacks the guild_id key */
  voice_states?: Partial<VoiceState>[];
  /** users in the guild */
  members?: GuildMember[];
  /** channels in the guild */
  channels?: Channel[];
  /** all active threads in the guild that current user has permission to view */
  threads?: Channel[];
  /** presences of the members in the guild, will only include non-offline members if the size is greater than large threshold */
  presences?: Partial<PresenceUpdate>[];
  /** the maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  max_presences?: integer | null;
  /** the maximum number of members for the guild */
  max_members?: integer;
  /** the vanity url code for the guild */
  vanity_url_code: string | null;
  /** the description of a Community guild */
  description: string | null;
  /** [banner hash](https://discord.com/developers/docs/reference#image-formatting) */
  banner: string | null;
  /** premium tier (Server Boost level) */
  premium_tier: PremiumTier;
  /** the number of boosts this guild currently has */
  premium_subscription_count?: integer;
  /** the preferred locale of a Community guild; used in server discovery and notices from Discord; defaults to "en-US" */
  preferred_locale: string;
  /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
  public_updates_channel_id: snowflake | null;
  /** the maximum amount of users in a video channel */
  max_video_channel_users?: integer;
  /** approximate number of members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true */
  approximate_member_count?: integer;
  /** approximate number of non-offline members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true */
  approximate_presence_count?: integer;
  /** the welcome screen of a Community guild, shown to new members, returned in an Invite's guild object */
  welcome_screen?: WelcomeScreen;
  /** guild NSFW level */
  nsfw_level: NsfwLevel;
  /** Stage instances in the guild */
  stage_instances?: StageInstance[];
  /** custom guild stickers */
  stickers?: Sticker[];
  /** the scheduled events in the guild */
  guild_scheduled_events?: ScheduledEvent[];
  /** whether the guild has the boost progress bar enabled */
  premium_progress_bar_enabled: boolean;
}

/** [Verification Level](https://discord.com/developers/docs/resources/guild#guild-object-verification-level) */
export enum VerificationLevel {
  /** unrestricted */
  NONE = 0,
  /** must have verified email on account */
  LOW = 1,
  /** must be registered on Discord for longer than 5 minutes */
  MEDIUM = 2,
  /** must be a member of the server for longer than 10 minutes */
  HIGH = 3,
  /** must have a verified phone number */
  VERY_HIGH = 4,
}

/** [Notification Level](https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level) */
export enum NotificationLevel {
  /** members will receive notifications for all messages by default */
  ALL_MESSAGES = 0,
  /** members will receive notifications only for messages that @mention them by default */
  ONLY_MENTIONS = 1,
}

/** [Explicit Content Filter Level](https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level) */
export enum ExplicitContentFilterLevel {
  /** media content will not be scanned */
  DISABLED = 0,
  /** media content sent by members without roles will be scanned */
  MEMBERS_WITHOUT_ROLES = 1,
  /** media content sent by all members will be scanned */
  ALL_MEMBERS = 2,
}

/** [Guild Feature](https://discord.com/developers/docs/resources/guild#guild-object-features) */
export enum GuildFeature {
  /** guild has access to set an animated guild icon */
  ANIMATED_ICON = "ANIMATED_ICON",
  /** guild has access to set a guild banner image */
  BANNER = "BANNER",
  /** guild has access to use commerce features (i.e. create store channels) */
  COMMERCE = "COMMERCE",
  /** guild can enable welcome screen, Membership Screening, stage channels and discovery, and receives community updates */
  COMMUNITY = "COMMUNITY",
  /** guild is able to be discovered in the directory */
  DISCOVERABLE = "DISCOVERABLE",
  /** guild is able to be featured in the directory */
  FEATURABLE = "FEATURABLE",
  /** guild has access to set an invite splash background */
  INVITE_SPLASH = "INVITE_SPLASH",
  /** guild has enabled [Membership Screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) */
  MEMBER_VERIFICATION_GATE_ENABLED = "MEMBER_VERIFICATION_GATE_ENABLED",
  /** guild has enabled monetization */
  MONETIZATION_ENABLED = "MONETIZATION_ENABLED",
  /** guild has increased custom sticker slots */
  MORE_STICKERS = "MORE_STICKERS",
  /** guild has access to create news channels */
  NEWS = "NEWS",
  /** guild is partnered */
  PARTNERED = "PARTNERED",
  /** guild can be previewed before joining via Membership Screening or the directory */
  PREVIEW_ENABLED = "PREVIEW_ENABLED",
  /** guild has access to create private threads */
  PRIVATE_THREADS = "PRIVATE_THREADS",
  /** guild is able to set role icons */
  ROLE_ICONS = "ROLE_ICONS",
  /** guild has access to the seven day archive time for threads */
  SEVEN_DAY_THREAD_ARCHIVE = "SEVEN_DAY_THREAD_ARCHIVE",
  /** guild has access to the three day archive time for threads */
  THREE_DAY_THREAD_ARCHIVE = "THREE_DAY_THREAD_ARCHIVE",
  /** guild has enabled ticketed events */
  TICKETED_EVENTS_ENABLED = "TICKETED_EVENTS_ENABLED",
  /** guild has access to set a vanity URL */
  VANITY_URL = "VANITY_URL",
  /** guild is verified */
  VERIFIED = "VERIFIED",
  /** guild has access to set 384kbps bitrate in voice (previously VIP voice servers) */
  VIP_REGIONS = "VIP_REGIONS",
  /** guild has enabled the welcome screen */
  WELCOME_SCREEN_ENABLED = "WELCOME_SCREEN_ENABLED",
}

/** [Guild MFA Level](https://discord.com/developers/docs/resources/guild#guild-object-mfa-level) */
export enum MfaLevel {
  /** guild has no MFA/2FA requirement for moderation actions */
  NONE = 0,
  /** guild has a 2FA requirement for moderation actions */
  ELEVATED = 1,
}

/** [System Channel Flags](https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags) */
export enum SystemChannelFlags {
  /** Suppress member join notifications */
  SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
  /** Suppress server boost notifications */
  SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1,
  /** Suppress server setup tips */
  SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 1 << 2,
  /** Hide member join sticker reply buttons */
  SUPPRESS_JOIN_NOTIFICATION_REPLIES = 1 << 3,
}

/** [Voice State Structure](https://discord.com/developers/docs/resources/voice#voice-state-object) */
export interface VoiceState {
  /** the guild id this voice state is for */
  guild_id?: snowflake;
  /** the channel id this user is connected to */
  channel_id: snowflake | null;
  /** the user id this voice state is for */
  user_id: snowflake;
  /** the guild member this voice state is for */
  member?: GuildMember;
  /** the session id for this voice state */
  session_id: string;
  /** whether this user is deafened by the server */
  deaf: boolean;
  /** whether this user is muted by the server */
  mute: boolean;
  /** whether this user is locally deafened */
  self_deaf: boolean;
  /** whether this user is locally muted */
  self_mute: boolean;
  /** whether this user is streaming using "Go Live" */
  self_stream?: boolean;
  /** whether this user's camera is enabled */
  self_video: boolean;
  /** whether this user is muted by the current user */
  suppress: boolean;
  /** the time at which the user requested to speak */
  request_to_speak_timestamp: string | null;
}

/** [Presence Update Structure](https://discord.com/developers/docs/topics/gateway#presence-update) */
export interface PresenceUpdate {
  /** the user presence is being updated for */
  user: User;
  /** id of the guild */
  guild_id: snowflake;
  /** either "idle", "dnd", "online", or "offline" */
  status: string;
  /** user's current activities */
  activities: Activity[];
  /** user's platform-dependent status */
  client_status: ClientStatus;
}

/** [Activity Structure](https://discord.com/developers/docs/topics/gateway#activity-object) */
export interface Activity {
  /** the activity's name */
  name: string;
  /** activity type */
  type: ActivityType;
  /** stream url, is validated when type is 1 */
  url?: string | null;
  /** unix timestamp (in milliseconds) of when the activity was added to the user's session */
  created_at: integer;
  /** unix timestamps for start and/or end of the game */
  timestamps?: ActivityTimestamps;
  /** application id for the game */
  application_id?: snowflake;
  /** what the player is currently doing */
  details?: string | null;
  /** the user's current party status */
  state?: string | null;
  /** the emoji used for a custom status */
  emoji?: Emoji | null;
  /** information for the current party of the player */
  party?: Party;
  /** images for the presence and their hover texts */
  assets?: Assets;
  /** secrets for Rich Presence joining and spectating */
  secrets?: Secrets;
  /** whether or not the activity is an instanced game session */
  instance?: boolean;
  /** activity flags ORd together, describes what the payload includes */
  flags?: integer;
  /** the custom buttons shown in the Rich Presence (max 2) */
  buttons?: ActivityButton[];
}

/** [Activity Type](https://discord.com/developers/docs/topics/gateway#activity-object-activity-type) */
export enum ActivityType {
  /** Playing {name} */
  Game = 0,
  /** Streaming {details} */
  Streaming = 1,
  /** Listening to {name} */
  Listening = 2,
  /** Watching {name} */
  Watching = 3,
  /** {emoji} {name} */
  Custom = 4,
  /** Competing in {name} */
  Competing = 5,
}

/** [Activity Timestamps](https://discord.com/developers/docs/topics/gateway#activity-object-timestamps) */
export interface ActivityTimestamps {
  /** unix time (in milliseconds) of when the activity started */
  start?: integer;
  /** unix time (in milliseconds) of when the activity ends */
  end?: integer;
}

/** [Party Structure](https://discord.com/developers/docs/topics/gateway#party-object) */
export interface Party {
  /** the id of the party */
  id?: string;
  /** used to show the party's current and maximum size */
  size?: [current_size: integer, max_size: integer];
}

/** [Assets Structure](https://discord.com/developers/docs/topics/gateway#activity-object-assets) */
export interface Assets {
  /** the id for a large asset of the activity, usually a snowflake */
  large_image?: string;
  /** text displayed when hovering over the large image of the activity */
  large_text?: string;
  /** the id for a small asset of the activity, usually a snowflake */
  small_image?: string;
  /** text displayed when hovering over the small image of the activity */
  small_text?: string;
}

/** [Secrets Structure](https://discord.com/developers/docs/topics/gateway#activity-object-secrets) */
export interface Secrets {
  /** the secret for joining a party */
  join?: string;
  /** the secret for spectating a game */
  spectate?: string;
  /** the secret for a specific instanced match */
  match?: string;
}

/** [Activity Flags](https://discord.com/developers/docs/topics/gateway#activity-object-activity-flags) */
export enum ActivityFlags {
  INSTANCE = 1 << 0,
  JOIN = 1 << 1,
  SPECTATE = 1 << 2,
  JOIN_REQUEST = 1 << 3,
  SYNC = 1 << 4,
  PLAY = 1 << 5,
  PARTY_PRIVACY_FRIENDS = 1 << 6,
  PARTY_PRIVACY_VOICE_CHANNEL = 1 << 7,
  EMBEDDED = 1 << 8,
}

/** [Activity Button Structure](https://discord.com/developers/docs/topics/gateway#activity-object-activity-button) */
export interface ActivityButton {
  /** the text shown on the button (1-32 characters) */
  label: string;
  /** the url opened when clicking the button (1-512 characters) */
  url: string;
}

/** [Client Status Structure](https://discord.com/developers/docs/topics/gateway#client-status-object) */
export interface ClientStatus {
  /** the user's status set for an active desktop (Windows, Linux, Mac) application session */
  desktop?: string;
  /** the user's status set for an active mobile (iOS, Android) application session */
  mobile?: string;
  /** the user's status set for an active web (browser, bot account) application session */
  web?: string;
}

/** [Premium Tier](https://discord.com/developers/docs/resources/guild#guild-object-premium-tier) */
export enum PremiumTier {
  /** guild has not unlocked any Server Boost perks */
  NONE = 0,
  /** guild has unlocked Server Boost level 1 perks */
  TIER_1 = 1,
  /** guild has unlocked Server Boost level 2 perks */
  TIER_2 = 2,
  /** guild has unlocked Server Boost level 3 perks */
  TIER_3 = 3,
}

/** [Welcome Screen Structure](https://discord.com/developers/docs/resources/guild#welcome-screen-object) */
export interface WelcomeScreen {
  /** the server description shown in the welcome screen */
  description: string | null;
  /** the channels shown in the welcome screen, up to 5 */
  welcome_channels: WelcomeScreenChannel[];
}

/** [Welcome Screen Channel Structure](https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-channel-object) */
export interface WelcomeScreenChannel {
  /** the channel's id */
  channel_id: snowflake;
  /** the description shown for the channel */
  description: string;
  /** the [emoji id](https://discord.com/developers/docs/reference#image-formatting), if the emoji is custom */
  emoji_id: snowflake | null;
  /** the emoji name if custom, the unicode character if standard, or null if no emoji is set */
  emoji_name: string | null;
}

/** [NSFW Level](https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level) */
export enum NsfwLevel {
  DEFAULT = 0,
  EXPLICIT = 1,
  SAFE = 2,
  AGE_RESTRICTED = 3,
}

/** [Stage Instance Structure](https://discord.com/developers/docs/resources/stage-instance#stage-instance-object) */
export interface StageInstance {
  /** The id of this Stage instance */
  id: snowflake;
  /** The guild id of the associated Stage channel */
  guild_id: snowflake;
  /** The id of the associated Stage channel */
  channel_id: snowflake;
  /** The topic of the Stage instance (1-120 characters) */
  topic: string;
  /** The privacy level of the Stage instance */
  privacy_level: PrivacyLevel;
  /** Whether or not Stage Discovery is disabled */
  discoverable_disabled: boolean;
}

/** [Privacy Level](https://discord.com/developers/docs/resources/guild#guild-object-privacy-level) */
export enum PrivacyLevel {
  /** The Stage instance is visible publicly, such as on Stage Discovery. */
  PUBLIC = 1,
  /** The Stage instance is visible to only guild members. */
  GUILD_ONLY = 2,
}

/** [Scheduled Event Structure](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object) */
export interface ScheduledEvent {
  /** the id of the scheduled event */
  id: snowflake;
  /** the guild id which the scheduled event belongs to */
  guild_id: snowflake;
  /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
  channel_id: snowflake | null;
  /** the id of the user that created the scheduled event * */
  creator_id: snowflake | null;
  /** the name of the scheduled event (1-100 characters) */
  name: string;
  /** the description of the scheduled event (1-1000 characters) */
  description?: string;
  /** the time the scheduled event will start */
  scheduled_start_time: string;
  /** the time the scheduled event will end, required if entity_type is EXTERNAL */
  scheduled_end_time: string | null;
  /** the privacy level of the scheduled event */
  privacy_level: EventPrivacyLevel;
  /** the status of the scheduled event */
  status: EventStatus;
  /** the type of the scheduled event */
  entity_type: ScheduledEntityType;
  /** the id of an entity associated with a guild scheduled event */
  entity_id: snowflake | null;
  /** additional metadata for the guild scheduled event */
  entity_metadata: EntityMetadata | null;
  /** the user that created the scheduled event */
  creator?: User;
  /** the number of users subscribed to the scheduled event */
  user_count?: integer;
}

export enum IntegrationExpireBehavior {
  RemoveRole = 0,
  Kick = 1,
}

/** [Account Structure](https://discord.com/developers/docs/resources/guild#integration-account-object) */
export interface IntegrationAccount {
  /** id of the account */
  id: string;
  /** name of the account */
  name: string;
}

/** [Integration Structure](https://discord.com/developers/docs/resources/guild#integration-object) */
export interface Integration {
  /** integration id */
  id: snowflake;
  /** integration name */
  name: string;
  /** integration type (twitch, youtube, or discord) */
  type: string;
  /** is this integration enabled */
  enabled: boolean;
  /** is this integration syncing */
  syncing?: boolean;
  /** id that this integration uses for "subscribers" */
  role_id?: snowflake;
  /** whether emoticons should be synced for this integration (twitch only currently) */
  enable_emoticons?: boolean;
  /** the behavior of expiring subscribers */
  expire_behavior?: IntegrationExpireBehavior;
  /** the grace period (in days) before expiring subscribers */
  expire_grace_period?: integer;
  /** user for this integration */
  user?: User;
  /** integration account information */
  account: IntegrationAccount;
  /** when this integration was last synced */
  synced_at?: string;
  /** how many subscribers this integration has */
  subscriber_count?: integer;
  /** has this integration been revoked */
  revoked?: boolean;
  /** The bot/OAuth2 application for discord integrations */
  application?: Application;
}

/** [Event Privacy Level](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level) */
export enum EventPrivacyLevel {
  /** the scheduled event is only accessible to guild members */
  GUILD_ONLY = 2,
}

/** [Event Status](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status) */
export enum EventStatus {
  SCHEDULED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELED = 4,
}

/** [Scheduled Entity Type](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-type) */
export enum ScheduledEntityType {
  STAGE_INSTANCE = 1,
  VOICE = 2,
  EXTERNAL = 3,
}

/** [Entity Metadata](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-entity-metadata) */
export interface EntityMetadata {
  /** location of the event (1-100 characters) */
  location?: string;
}

interface UnavailableGuild {
  id: snowflake;
  unavailable: true;
}

/** [Gateway Events](https://discord.com/developers/docs/topics/gateway#commands-and-events-gateway-events) */
export enum GatewayEvent {
  /** contains the initial state information */
  Ready = "READY",
  /** response to Resume */
  Resumed = "RESUMED",
  /** server is going away, client should reconnect to gateway and resume */
  Reconnect = "RECONNECT",
  /** failure response to Identify or Resume or invalid active session */
  InvalidSession = "INVALID_SESSION",
  /** new guild channel created */
  ChannelCreate = "CHANNEL_CREATE",
  /** channel was updated */
  ChannelUpdate = "CHANNEL_UPDATE",
  /** channel was deleted */
  ChannelDelete = "CHANNEL_DELETE",
  /** message was pinned or unpinned */
  ChannelPinsUpdate = "CHANNEL_PINS_UPDATE",
  /** thread created, also sent when being added to a private thread */
  ThreadCreate = "THREAD_CREATE",
  /** thread was updated */
  ThreadUpdate = "THREAD_UPDATE",
  /** thread was deleted */
  ThreadDelete = "THREAD_DELETE",
  /** sent when gaining access to a channel, contains all active threads in that channel */
  ThreadListSync = "THREAD_LIST_SYNC",
  /** thread member for the current user was updated */
  ThreadMemberUpdate = "THREAD_MEMBER_UPDATE",
  /** some user(s) were added to or removed from a thread */
  ThreadMembersUpdate = "THREAD_MEMBERS_UPDATE",
  /** lazy-load for unavailable guild, guild became available, or user joined a new guild */
  GuildCreate = "GUILD_CREATE",
  /** guild was updated */
  GuildUpdate = "GUILD_UPDATE",
  /** guild became unavailable, or user left/was removed from a guild */
  GuildDelete = "GUILD_DELETE",
  /** user was banned from a guild */
  GuildBanAdd = "GUILD_BAN_ADD",
  /** user was unbanned from a guild */
  GuildBanRemove = "GUILD_BAN_REMOVE",
  /** guild emojis were updated */
  GuildEmojisUpdate = "GUILD_EMOJIS_UPDATE",
  /** guild stickers were updated */
  GuildStickersUpdate = "Guild_Stickers_Update",
  /** guild integration was updated */
  GuildIntegrationsUpdate = "GUILD_INTEGRATIONS_UPDATE",
  /** new user joined a guild */
  GuildMemberAdd = "GUILD_MEMBER_ADD",
  /** user was removed from a guild */
  GuildMemberRemove = "GUILD_MEMBER_REMOVE",
  /** guild member was updated */
  GuildMemberUpdate = "GUILD_MEMBER_UPDATE",
  /** response to Request GuildMembers */
  GuildMembersChunk = "GUILD_MEMBERS_CHUNK",
  /** guild role was created */
  GuildRoleCreate = "GUILD_ROLE_CREATE",
  /** guild role was updated */
  GuildRoleUpdate = "GUILD_ROLE_UPDATE",
  /** guild role was deleted */
  GuildRoleDelete = "GUILD_ROLE_DELETE",
  /** guild scheduled event was created */
  GuildScheduledEventCreate = "GUILD_SCHEDULED_EVENT_CREATE",
  /** guild scheduled event was updated */
  GuildScheduledEventUpdate = "GUILD_SCHEDULED_EVENT_UPDATE",
  /** guild scheduled event was deleted */
  GuildScheduledEventDelete = "GUILD_SCHEDULED_EVENT_DELETE",
  /** user subscribed to a guild scheduled event */
  GuildScheduledEventUserAdd = "GUILD_SCHEDULED_EVENT_USER_ADD",
  /** user unsubscribed from a guild scheduled event */
  GuildScheduledEventUserRemove = "GUILD_SCHEDULED_EVENT_USER_REMOVE",
  /** guild integration was created */
  IntegrationCreate = "INTEGRATION_CREATE",
  /** guild integration was updated */
  IntegrationUpdate = "INTEGRATION_UPDATE",
  /** guild integration was deleted */
  IntegrationDelete = "INTEGRATION_DELETE",
  /** user used an interaction, such as an Application Command */
  InteractionCreate = "INTERACTION_CREATE",
  /** invite to a channel was created */
  InviteCreate = "INVITE_CREATE",
  /** invite to a channel was deleted */
  InviteDelete = "INVITE_DELETE",
  /** message was created */
  MessageCreate = "MESSAGE_CREATE",
  /** message was edited */
  MessageUpdate = "MESSAGE_UPDATE",
  /** message was deleted */
  MessageDelete = "MESSAGE_DELETE",
  /** multiple messages were deleted at once */
  MessageDeleteBulk = "MESSAGE_DELETE_BULK",
  /** user reacted to a message */
  MessageReactionAdd = "MESSAGE_REACTION_ADD",
  /** user removed a reaction from a message */
  MessageReactionRemove = "MESSAGE_REACTION_REMOVE",
  /** all reactions were explicitly removed from a message */
  MessageReactionRemoveAll = "MESSAGE_REACTION_REMOVE_ALL",
  /** all reactions for a given emoji were explicitly removed from a message */
  MessageReactionRemoveEmoji = "MESSAGE_REACTION_REMOVE_EMOJI",
  /** user was updated */
  PresenceUpdate = "PRESENCE_UPDATE",
  /** stage instance was created */
  StageInstanceCreate = "STAGE_INSTANCE_CREATE",
  /** stage instance was deleted or closed */
  StageInstanceDelete = "STAGE_INSTANCE_DELETE",
  /** stage instance was updated */
  StageInstanceUpdate = "STAGE_INSTANCE_UPDATE",
  /** user started typing in a channel */
  TypingStart = "TYPING_START",
  /** properties about the user changed */
  UserUpdate = "USER_UPDATE",
  /** someone joined, left, or moved a voice channel */
  VoiceStateUpdate = "VOICE_STATE_UPDATE",
  /** guild's voice server was updated */
  VoiceServerUpdate = "VOICE_SERVER_UPDATE",
  /** guild channel webhook was created, update, or deleted */
  WebhooksUpdate = "WEBHOOKS_UPDATE",
}

/** [Ready Structure](https://discord.com/developers/docs/topics/gateway#ready) */
export interface Ready {
  /** [gateway version](https://discord.com/developers/docs/topics/gateway#gateways-gateway-versions) */
  v: integer;
  /** information about the user including email */
  user: User;
  /** the guilds the user is in */
  guilds: UnavailableGuild[];
  /** used for resuming connections */
  session_id: string;
  /** the [shard information](https://discord.com/developers/docs/topics/gateway#sharding) associated with this session, if sent when identifying */
  shard?: [shard_id: integer, num_shards: integer];
  /** contains id and flags */
  application: Partial<Application>;
}

/** [Channel Pins Update Structure](https://discord.com/developers/docs/topics/gateway#channel-pins-update) */
export interface ChannelPinsUpdate {
  /** the id of the guild */
  guild_id?: snowflake;
  /** the id of the channel */
  channel_id: snowflake;
  /** the time at which the most recent pinned message was pinned */
  last_pin_timestamp?: string | null;
}

/** [Thread List Sync Structure](https://discord.com/developers/docs/topics/gateway#thread-list-sync) */
export interface ThreadListSync {
  /** the id of the guild */
  guild_id: snowflake;
  /** the parent channel ids whose threads are being synced. If omitted, then threads were synced for the entire guild. This array may contain channel_ids that have no active threads as well, so you know to clear that data. */
  channel_ids?: snowflake[];
  /** all active threads in the given channels that the current user can access */
  threads: Channel[];
  /** all thread member objects from the synced threads for the current user, indicating which threads the current user has been added to */
  members: ThreadMember[];
}

/** [Guild Ban Add Structure](https://discord.com/developers/docs/topics/gateway#guild-ban-add) */
export interface GuildBanAdd {
  /** id of the guild */
  guild_id: snowflake;
  /** the banned user */
  user: User;
}

/** [Guild Ban Remove Structure](https://discord.com/developers/docs/topics/gateway#guild-ban-remove) */
export interface GuildBanRemove {
  /** id of the guild */
  guild_id: snowflake;
  /** the unbanned user */
  user: User;
}

/** [Guild Emojis Update Structure](https://discord.com/developers/docs/topics/gateway#guild-emojis-update) */
export interface GuildEmojisUpdate {
  /** id of the guild */
  guild_id: snowflake;
  /** array of emojis */
  emojis: Emoji[];
}

/** [Guild Stickers Update Structure](https://discord.com/developers/docs/topics/gateway#guild-stickers-update) */
export interface GuildStickersUpdate {
  /** id of the guild */
  guild_id: snowflake;
  /** array of stickers */
  stickers: Sticker[];
}

/** [Guild Integrations Structure](https://discord.com/developers/docs/topics/gateway#guild-integrations-update) */
export interface GuildIntegrationsUpdate {
  /** id of the guild whose integrations were updated */
  guild_id: snowflake;
}

/** [Guild Member Remove Structure](https://discord.com/developers/docs/topics/gateway#guild-member-remove) */
export interface GuildMemberRemove {
  /** the id of the guild */
  guild_id: snowflake;
  /** the user who was removed */
  user: User;
}

/** [Guild Member Update Structure](https://discord.com/developers/docs/topics/gateway#guild-member-update) */
export interface GuildMemberUpdate {
  /** the id of the guild */
  guild_id: snowflake;
  /** user role ids */
  roles: snowflake[];
  /** the user */
  user: User;
  /** nickname of the user in the guild */
  nick?: string | null;
  /** the member's guild avatar hash */
  avatar: string | null;
  /** when the user joined the guild */
  joined_at: string | null;
  /** when the user starting [boosting](https://support.discord.com/hc/en-us/articles/360028038352-Server-Boosting-) the guild */
  premium_since?: string | null;
  /** whether the user is deafened in voice channels */
  deaf?: boolean;
  /** whether the user is muted in voice channels */
  mute?: boolean;
  /** whether the user has not yet passed the guild's [Membership Screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) requirements */
  pending?: boolean;
}

/** [Guild Members Chunk Structure](https://discord.com/developers/docs/topics/gateway#guild-members-chunk) */
export interface GuildMembersChunk {
  /** the id of the guild */
  guild_id: snowflake;
  /** set of guild members */
  members: GuildMember[];
  /** the chunk index in the expected chunks for this response (0 <= chunk_index < chunk_count) */
  chunk_index: integer;
  /** the total number of expected chunks for this response */
  chunk_count: integer;
  /** if passing an invalid id to REQUEST_GUILD_MEMBERS, it will be returned here */
  not_found?: string[];
  /** if passing true to REQUEST_GUILD_MEMBERS, presences of the returned members will be here */
  presences?: PresenceUpdate[];
  /** the nonce used in the [Guild Members Request](https://discord.com/developers/docs/topics/gateway#request-guild-members) */
  nonce?: string;
}

/** [Guild Role Create Structure](https://discord.com/developers/docs/topics/gateway#guild-role-create) */
export interface GuildRoleCreate {
  /** the id of the guild */
  guild_id: snowflake;
  role: Role;
}

/** [Guild Role Update Structure](https://discord.com/developers/docs/topics/gateway#guild-role-update) */
export interface GuildRoleUpdate {
  /** the id of the guild */
  guild_id: snowflake;
  /** the role updated */
  role: Role;
}

/** [Guild Role Delete Structure](https://discord.com/developers/docs/topics/gateway#guild-role-delete) */
export interface GuildRoleDelete {
  /** the id of the guild */
  guild_id: snowflake;
  /** id of the role */
  role_id: snowflake;
}

/** [Guild Scheduled Event User Add Structure](https://discord.com/developers/docs/topics/gateway#guild-scheduled-event-user-add) */
export interface GuildScheduledEventUserAdd {
  /** id of the guild scheduled event */
  guild_scheduled_event_id: snowflake;
  /** id of the user */
  user_id: snowflake;
  /** id of the guild */
  guild_id: snowflake;
}
/** [Guild Scheduled Event User Remove Structure](https://discord.com/developers/docs/topics/gateway#guild-scheduled-event-user-remove) */
export interface GuildScheduledEventUserRemove {
  /** id of the guild scheduled event */
  guild_scheduled_event_id: snowflake;
  /** id of the user */
  user_id: snowflake;
  /** id of the guild */
  guild_id: snowflake;
}

/** [Integration Delete Structure](https://discord.com/developers/docs/topics/gateway#integration-delete) */
export interface IntegrationDelete {
  /** integration id */
  id: snowflake;
  /** id of the guild */
  guild_id: snowflake;
  /** id of the bot/OAuth2 application for this discord integration */
  application_id?: snowflake;
}

enum InviteTarget {
  STREAM = 1,
  EMBEDDED_APPLICATION = 2,
}

/** [Invite Create Structure](https://discord.com/developers/docs/topics/gateway#invite-create) */
export interface InviteCreate {
  /** the channel the invite is for */
  channel_id: snowflake;
  /** the unique invite [code](https://discord.com/developers/docs/resources/invite#invite-object) */
  code: string;
  /** the time at which the invite was created */
  created_at: string;
  /** the guild of the invite */
  guild_id?: snowflake;
  /** the user that created the invite */
  inviter?: User;
  /** how long the invite is valid for (in seconds) */
  max_age: integer;
  /** the maximum number of times the invite can be used */
  max_uses: integer;
  /** the type of target for this voice channel invite */
  target_type?: InviteTarget;
  /** the user whose stream to display for this voice channel stream invite */
  target_user?: User;
  /** the embedded application to open for this voice channel embedded application invite */
  target_application?: Partial<Application>;
  /** whether or not the invite is temporary (invited users will be kicked on disconnect unless they're assigned a role) */
  temporary: boolean;
  /** how many times the invite has been used (always will be 0) */
  uses: 0;
}

/** [Invite Delete Structure](https://discord.com/developers/docs/topics/gateway#invite-delete) */
export interface InviteDelete {
  /** the channel of the invite */
  channel_id: snowflake;
  /** the guild of the invite */
  guild_id?: snowflake;
  /** the unique invite code */
  code: string;
}

/** [Message Delete Structure](https://discord.com/developers/docs/topics/gateway#message-delete) */
export interface MessageDelete {
  /** the id of the message */
  id: snowflake;
  /** the id of the channel */
  channel_id: snowflake;
  /** the id of the guild */
  guild_id?: snowflake;
}

/** [Message Delete Bulk Structure](https://discord.com/developers/docs/topics/gateway#message-delete-bulk) */
export interface MessageDeleteBulk {
  /** the ids of the messages */
  ids: snowflake[];
  /** the id of the channel */
  channel_id: snowflake;
  /** the id of the guild */
  guild_id?: snowflake;
}

/** [Message Reaction Remove All Structure](https://discord.com/developers/docs/topics/gateway#message-reaction-remove-all) */
export interface MessageReactionRemoveAll {
  /** the id of the channel */
  channel_id: snowflake;
  /** the id of the message */
  message_id: snowflake;
  /** the id of the guild */
  guild_id?: snowflake;
}

/** [Message Reaction Remove Emoji](https://discord.com/developers/docs/topics/gateway#message-reaction-remove-emoji) */
export interface MessageReactionRemoveEmoji {
  /** the id of the channel */
  channel_id: snowflake;
  /** the id of the guild */
  guild_id?: snowflake;
  /** the id of the message */
  message_id: snowflake;
  /** the emoji that was removed */
  emoji: Partial<Emoji>;
}

/** [Typing Start Structure](https://discord.com/developers/docs/topics/gateway#typing-start) */
export interface TypingStart {
  /** id of the channel */
  channel_id: snowflake;
  /** id of the guild */
  guild_id?: snowflake;
  /** id of the user */
  user_id: snowflake;
  /** unix time (in seconds) of when the user started typing */
  timestamp: integer;
  /** the member who started typing if this happened in a guild */
  member?: GuildMember;
}

/** [Voice Server Update Structure](https://discord.com/developers/docs/topics/gateway#voice-state-update) */
export interface VoiceServerUpdate {
  /** voice connection token */
  token: string;
  /** the guild this voice server update is for */
  guild_id: snowflake;
  /** the voice server host */
  endpoint: string | null;
}

/** [Webhooks Update Structure](https://discord.com/developers/docs/topics/gateway#webhooks-update) */
export interface WebhooksUpdate {
  /** id of the guild */
  guild_id: snowflake;
  /** id of the channel */
  channel_id: snowflake;
}

/** [Allowed Mention Types](https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types) */
export enum AllowedMentionTypes {
  /** Controls role mentions */
  RoleMentions = "roles",
  /** Controls user mentions */
  UserMentions = "users",
  /** Controls @everyone and @here mentions */
  EveryoneMentions = "everyone",
}

/** [Allowed Mentions Object](https://discord.com/developers/docs/resources/channel#allowed-mentions-object) */
export interface AllowedMentions {
  /** An array of allowed mention types to parse from the content. */
  parse: AllowedMentionTypes[];
  /** Array of role_ids to mention (Max size of 100) */
  roles: snowflake[];
  /** Array of user_ids to mention (Max size of 100) */
  users: snowflake[];
  /** For replies, whether to mention the author of the message being replied to (default false) */
  replied_user: boolean;
}

/** [Payload Structure](https://discord.com/developers/docs/topics/gateway#payloads) */
export type Payload =
  | DispatchPayload
  | HeartbeatPayload
  | IdentifyPayload
  | HelloPayload
  | ResumePayload
  | RequestGuildMembersPayload
  | UpdateVoiceStatePayload
  | UpdatePresencePayload
  | HeartbeatACKPayload
  | InvalidSessionPayload
  | ReconnectPayload;

interface DispatchPayloadBase<
  T extends GatewayEvent,
  D extends unknown
> {
  /** opcode for the payload */
  op: OpCode.Dispatch;
  /** sequence number, used for resuming sessions and heartbeats */
  s: integer;
  t: T;
  d: D;
}

export type DispatchPayload =
  | DispatchPayloadBase<GatewayEvent.Ready, Ready>
  | DispatchPayloadBase<GatewayEvent.Resumed, unknown>
  | DispatchPayloadBase<GatewayEvent.Reconnect, unknown>
  | DispatchPayloadBase<
      GatewayEvent.InvalidSession,
      boolean
    >
  | DispatchPayloadBase<GatewayEvent.ChannelCreate, Channel>
  | DispatchPayloadBase<GatewayEvent.ChannelUpdate, Channel>
  | DispatchPayloadBase<GatewayEvent.ChannelDelete, Channel>
  | DispatchPayloadBase<
      GatewayEvent.ChannelPinsUpdate,
      ChannelPinsUpdate
    >
  | DispatchPayloadBase<GatewayEvent.ThreadCreate, Channel>
  | DispatchPayloadBase<GatewayEvent.ThreadUpdate, Channel>
  | DispatchPayloadBase<
      GatewayEvent.ThreadDelete,
      Pick<
        Channel,
        "id" | "guild_id" | "parent_id" | "type"
      >
    >
  | DispatchPayloadBase<
      GatewayEvent.ThreadListSync,
      ThreadListSync
    >
  | DispatchPayloadBase<
      GatewayEvent.ThreadMemberUpdate,
      ThreadMember
    >
  | DispatchPayloadBase<
      GatewayEvent.ThreadMembersUpdate,
      ThreadMember[]
    >
  | DispatchPayloadBase<GatewayEvent.GuildCreate, Guild>
  | DispatchPayloadBase<GatewayEvent.GuildUpdate, Guild>
  | DispatchPayloadBase<
      GatewayEvent.GuildDelete,
      UnavailableGuild
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildBanAdd,
      GuildBanAdd
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildBanRemove,
      GuildBanRemove
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildEmojisUpdate,
      GuildEmojisUpdate
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildStickersUpdate,
      GuildStickersUpdate
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildIntegrationsUpdate,
      GuildIntegrationsUpdate
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildMemberAdd,
      GuildMember & { guild_id: snowflake }
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildMemberRemove,
      GuildMemberRemove
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildMemberRemove,
      GuildMemberUpdate
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildMembersChunk,
      GuildMembersChunk
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildRoleCreate,
      GuildRoleCreate
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildRoleUpdate,
      GuildRoleUpdate
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildRoleDelete,
      GuildRoleDelete
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildScheduledEventCreate,
      ScheduledEvent
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildScheduledEventUpdate,
      ScheduledEvent
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildScheduledEventDelete,
      ScheduledEvent
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildScheduledEventUserAdd,
      GuildScheduledEventUserAdd
    >
  | DispatchPayloadBase<
      GatewayEvent.GuildScheduledEventUserRemove,
      GuildScheduledEventUserRemove
    >
  | DispatchPayloadBase<
      GatewayEvent.IntegrationCreate,
      Integration & { guild_id: snowflake }
    >
  | DispatchPayloadBase<
      GatewayEvent.IntegrationUpdate,
      Integration & { guild_id: snowflake }
    >
  | DispatchPayloadBase<
      GatewayEvent.IntegrationDelete,
      IntegrationDelete
    >
  | DispatchPayloadBase<
      GatewayEvent.InteractionCreate,
      Interaction
    >
  | DispatchPayloadBase<
      GatewayEvent.InviteCreate,
      InviteCreate
    >
  | DispatchPayloadBase<
      GatewayEvent.InviteDelete,
      InviteDelete
    >
  | DispatchPayloadBase<GatewayEvent.MessageCreate, Message>
  | DispatchPayloadBase<
      GatewayEvent.MessageUpdate,
      Partial<Message>
    >
  | DispatchPayloadBase<
      GatewayEvent.MessageDelete,
      MessageDelete
    >
  | DispatchPayloadBase<
      GatewayEvent.MessageDeleteBulk,
      MessageDeleteBulk
    >
  | DispatchPayloadBase<
      GatewayEvent.MessageReactionAdd,
      MessageReactionAdd
    >
  | DispatchPayloadBase<
      GatewayEvent.MessageReactionRemove,
      MessageReactionRemove
    >
  | DispatchPayloadBase<
      GatewayEvent.MessageReactionRemoveAll,
      MessageReactionRemoveAll
    >
  | DispatchPayloadBase<
      GatewayEvent.MessageReactionRemoveEmoji,
      MessageReactionRemoveEmoji
    >
  | DispatchPayloadBase<
      GatewayEvent.PresenceUpdate,
      PresenceUpdate
    >
  | DispatchPayloadBase<
      GatewayEvent.StageInstanceCreate,
      StageInstance
    >
  | DispatchPayloadBase<
      GatewayEvent.StageInstanceUpdate,
      StageInstance
    >
  | DispatchPayloadBase<
      GatewayEvent.StageInstanceDelete,
      StageInstance
    >
  | DispatchPayloadBase<
      GatewayEvent.TypingStart,
      TypingStart
    >
  | DispatchPayloadBase<GatewayEvent.UserUpdate, User>
  | DispatchPayloadBase<
      GatewayEvent.VoiceServerUpdate,
      VoiceServerUpdate
    >
  | DispatchPayloadBase<
      GatewayEvent.VoiceStateUpdate,
      VoiceState
    >
  | DispatchPayloadBase<
      GatewayEvent.WebhooksUpdate,
      WebhooksUpdate
    >;

interface HeartbeatPayload {
  op: OpCode.Heartbeat;
  d: integer;
}

export interface IdentifyPayload {
  op: OpCode.Identify;
  d: Identify;
}

interface HelloPayload {
  op: OpCode.Hello;
  d: Hello;
  s: integer;
  t: string;
}

interface ResumePayload {
  op: OpCode.Resume;
  d: Resume;
}

interface RequestGuildMembersPayload {
  op: OpCode.RequestGuildMembers;
  d: RequestGuildMembers;
}

interface UpdateVoiceStatePayload {
  op: OpCode.VoiceStateUpdate;
  d: UpdateVoiceState;
}

interface UpdatePresencePayload {
  op: OpCode.PresenceUpdate;
  d: UpdatePresence;
}

interface HeartbeatACKPayload {
  op: OpCode.HeartbeatACK;
}

interface InvalidSessionPayload {
  op: OpCode.InvalidSession;
  /** The inner d key is a boolean that indicates whether the session may be resumable. See Connecting and Resuming for more information. */
  d: boolean;
}

interface ReconnectPayload {
  op: OpCode.Reconnect;
  d: GatewayCloseEventCode;
}

/** [Resume Structure] */
export interface Resume {
  /** string */
  token: string;
  /** string */
  session_id: string;
  /** integer */
  seq: integer;
}

/** [Gateway Close Event Codes](https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes) */
export enum GatewayCloseEventCode {
  /** We're not sure what went wrong. Try reconnecting? */
  UnknownError = 4000,
  /** You sent an invalid Gateway opcode or an invalid payload for an opcode. Don't do that! */
  UnknownOpcode = 4001,
  /** You sent an invalid payload to us. Don't do that! */
  DecodeError = 4002,
  /** You sent us a payload prior to identifying. */
  NotAuthenticated = 4003,
  /** The account token sent with your identify payload is incorrect. */
  AuthenticationFailed = 4004,
  /** You sent more than one identify payload. Don't do that! */
  AlreadyAuthenticated = 4005,
  /** The sequence sent when resuming the session was invalid. Reconnect and start a new session. */
  InvalidSeq = 4007,
  /** Woah nelly! You're sending payloads to us too quickly. Slow it down! You will be disconnected on receiving this. */
  RateLimited = 4008,
  /** Your session timed out. Reconnect and start a new one. */
  SessionTimedOut = 4009,
  /** You sent us an invalid shard when identifying. */
  InvalidShard = 4010,
  /** The session would have handled too many guilds - you are required to shard your connection in order to connect. */
  ShardingRequired = 4011,
  /** You sent an invalid version for the gateway. */
  InvalidAPIVersion = 4012,
  /** You sent an invalid intent for a Gateway Intent. You may have incorrectly calculated the bitwise value. */
  InvalidIntents = 4013,
  /** You sent a disallowed intent for a Gateway Intent. You may have tried to specify an intent that you have not enabled or are not approved for. */
  DisallowedIntents = 4014,
}

/** [Request Guild Members Structure](https://discord.com/developers/docs/topics/gateway#request-guild-members) */
export interface RequestGuildMembers {
  /** id of the guild to get members for */
  guild_id: snowflake;
  /** string that username starts with, or an empty string to return all members */
  query?: string;
  /** maximum number of members to send matching the query; a limit of 0 can be used with an empty string query to return all members */
  limit: integer;
  /** used to specify if we want the presences of the matched members */
  presences?: boolean;
  /** used to specify which users you wish to fetch */
  user_ids?: snowflake | snowflake[];
  /** nonce to identify the [Guild Members Chunk](https://discord.com/developers/docs/topics/gateway#guild-members-chunk) response */
  nonce?: string;
}

/** [Update Voice State Structure](https://discord.com/developers/docs/topics/gateway#update-voice-state) */
export interface UpdateVoiceState {
  /** id of the guild */
  guild_id: snowflake;
  /** id of the voice channel client wants to join (null if disconnecting) */
  channel_id: snowflake | null;
  /** is the client muted */
  self_mute: boolean;
  /** is the client deafened */
  self_deaf: boolean;
}

export enum OpCode {
  /** Receive - An event was dispatched. */
  Dispatch = 0,
  /** Send/Receive - Fired periodically by the client to keep the connection alive. */
  Heartbeat = 1,
  /** Send - Starts a new session during the initial handshake. */
  Identify = 2,
  /** Send - Update the client's presence. */
  PresenceUpdate = 3,
  /** Send - Used to join/leave or move between voice channels. */
  VoiceStateUpdate = 4,
  /** Send - Resume a previous session that was disconnected. */
  Resume = 6,
  /** Receive - You should attempt to reconnect and resume immediately. */
  Reconnect = 7,
  /** Send - Request information about offline guild members in a large guild. */
  RequestGuildMembers = 8,
  /** Receive - The session has been invalidated. You should reconnect and identify/resume accordingly. */
  InvalidSession = 9,
  /** Receive - Sent immediately after connecting, contains the heartbeat_interval to use. */
  Hello = 10,
  /** Receive - Sent in response to receiving a heartbeat to acknowledge that it has been received. */
  HeartbeatACK = 11,
}

/** [Hello Structure](https://discord.com/developers/docs/topics/gateway#hello) */
export interface Hello {
  /** the interval (in milliseconds) the client should heartbeat with */
  heartbeat_interval: integer;
}

/** [Identify Structure](https://discord.com/developers/docs/topics/gateway#identify) */
export interface Identify {
  /** authentication token */
  token: string;
  /** connection properties */
  properties: ConnectionProperties;
  /** whether this connection supports compression of packets
   * @defaultValue = false */
  compress?: boolean;
  /** value between 50 and 250, total number of members where the gateway will stop sending offline members in the guild member list
   * @defaultValue 50 */
  large_threshold?: integer;
  /** used for [Guild Sharding](https://discord.com/developers/docs/topics/gateway#sharding) */
  shard?: [shard_id: integer, shard_count: integer];
  /** presence structure for initial presence information */
  presence?: UpdatePresence;
  /** the Gateway Intents you wish to receive */
  intents: integer;
}

/** [Connection Properties Structure](https://discord.com/developers/docs/topics/gateway#connection-properties) */
export interface ConnectionProperties {
  /** your operating system */
  $os: string;
  /** your library name */
  $browser: string;
  /** your library name */
  $device: string;
}

/** [Update Presence Structure](https://discord.com/developers/docs/topics/gateway#update-presence) */
export interface UpdatePresence {
  /** unix time (in milliseconds) of when the client went idle, or null if the client is not idle */
  since: integer | null;
  /** the user's activities */
  activities: Activity[];
  /** the user's new status */
  status: Status;
  /** whether or not the client is afk */
  afk: boolean;
}

/** [Status Types](https://discord.com/developers/docs/topics/gateway#update-presence-status-types) */
export enum Status {
  Online = "online",
  DoNotDisturb = "dnd",
  AFK = "idle",
  Invisible = "invisible",
  Offline = "offline",
}

/** [Gateway Intents](https://discord.com/developers/docs/topics/gateway#gateway-intents) */
export enum GatewayIntents {
  GUILDS = 1 << 0,
  GUILD_MEMBERS = 1 << 1,
  GUILD_BANS = 1 << 2,
  GUILD_EMOJIS = 1 << 3,
  GUILD_INTEGRATIONS = 1 << 4,
  GUILD_WEBHOOKS = 1 << 5,
  GUILD_INVITES = 1 << 6,
  GUILD_VOICE_STATES = 1 << 7,
  GUILD_PRESENCES = 1 << 8,
  GUILD_MESSAGES = 1 << 9,
  GUILD_MESSAGE_REACTIONS = 1 << 10,
  GUILD_MESSAGE_TYPING = 1 << 11,
  DIRECT_MESSAGES = 1 << 12,
  DIRECT_MESSAGE_REACTIONS = 1 << 13,
  DIRECT_MESSAGE_TYPING = 1 << 14,
  GUILD_SCHEDULED_EVENTS = 1 << 16,
}
