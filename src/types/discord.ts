type snowflake = string;
type integer = number;

// Application

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
  emoji?: Partial<Emoji>;
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
  options?: CommandInteractionDataOption;
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
