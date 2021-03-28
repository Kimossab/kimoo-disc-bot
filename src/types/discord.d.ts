type snowflake = string;

declare namespace discord {
  type allowed_mentions_types = 'roles' | 'users' | 'everyone';
  type application_command_option_type = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  declare interface session_start_limit {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
  }

  declare interface gateway_bot {
    url: string;
    shards: number;
    session_start_limit: session_start_limit;
  }

  declare interface payload {
    op: constants.opcodes;
    d?: any;
    s: ?number;
    t: ?string;
  }

  declare interface hello {
    heartbeat_interval: number;
  }

  declare interface connection_properties {
    $os: string;
    $browser: string;
    $device: string;
  }

  declare interface activity {
    name: string;
    type: 0 | 1 | 2 | 4 | 5;
    url?: ?string;
  }

  declare interface update_status {
    since: ?number;
    activities: ?activity[];
    status: 'online' | 'dnd' | 'idle' | 'invisible' | 'offline';
    afk: boolean;
  }

  //requests
  declare interface identify {
    token: string;
    properties: connection_properties;
    compress?: boolean;
    large_threshold?: number;
    shard?: [number, number];
    presence?: update_status;
    guild_subscriptions?: boolean;
    intents: number;
  }

  declare interface request_guild_members {
    guild_id: snowflake;
    query?: string;
    limit: number;
    presences?: boolean;
    user_ids?: snowflake | snowflake[];
    nonce?: string;
  }

  declare interface guild_members_chunk {
    guild_id: snowflake;
    members: guild_member[];
    chunk_index: number;
    chunk_count: number;
    not_found?: snowflake[];
    presences?: presence_update[];
    nonce?: string;
  }

  //models
  declare interface user {
    id: snowflake;
    username: string;
    discriminator: string;
    avatar: ?string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    locale?: string;
    verified?: boolean;
    email?: ?string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
  }

  declare interface role_tags {
    bot_id?: snowflake;
    integration_id?: snowflake;
    premium_subscriber?: null;
  }

  declare interface role {
    id: snowflake;
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    tags?: role_tags;
  }

  declare interface emoji {
    id: ?snowflake;
    name: ?string;
    roles?: role[];
    user?: user;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
  }

  declare interface guild_member {
    user?: user;
    nick: ?string;
    roles: snowflake[];
    joined_at: string;
    premium_since?: ?string;
    deaf: boolean;
    mute: boolean;
    pending?: boolean;
  }

  declare interface voice_state {
    guild_id?: snowflake;
    channel_id: ?snowflake;
    user_id: snowflake;
    member?: guild_member;
    session_id: string;
    deaf: boolean;
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    self_stream?: boolean;
    self_video: boolean;
    suppress: boolean;
  }

  declare interface overwrite {
    id: snowflake;
    type: 0 | 1;
    allow: string;
    deny: string;
  }

  declare interface channel {
    id: snowflake;
    type: number;
    guild_id?: snowflake;
    position?: number;
    permission_overwrites?: overwrite[];
    name?: string;
    topic?: ?string;
    nsfw?: boolean;
    last_message_id?: ?snowflake;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    recipients?: user[];
    icon?: ?string;
    owner_id?: snowflake;
    application_id?: snowflake;
    parent_id?: ?snowflake;
    last_pin_timestamp?: ?string;
  }

  declare interface client_status {
    desktop?: string;
    mobile?: string;
    web?: string;
  }

  declare interface presence_update {
    user: user;
    guild_id: snowflake;
    status: string;
    activities: activity[];
    client_status: client_status;
  }

  declare interface guild {
    id: snowflake;
    name: string;
    icon: ?string;
    icon_hash?: ?string;
    splash: ?string;
    discovery_splash: ?string;
    owner?: boolean;
    owner_id: snowflake;
    permissions?: string;
    region: string;
    afk_channel_id: ?snowflake;
    afk_timeout: number;
    widget_enabled?: boolean;
    widget_channel_id?: ?snowflake;
    verification_level: number;
    default_message_notifications: number;
    explicit_content_filter: number;
    roles: role[];
    emojis: emoji[];
    features: string[];
    mfa_level: number;
    application_id: ?snowflake;
    system_channel_id: ?snowflake;
    system_channel_flags: number;
    joined_at?: string;
    large?: boolean;
    unavailable?: boolean;
    member_count?: number;
    voice_states?: voice_state[];
    members?: guild_member[];
    channels?: channel[];
    presences?: presence_update[];
    max_presences?: ?number;
    max_members?: number;
    vanity_url_code: ?string;
    description: ?string;
    banner: ?string;
    premium_tier: number;
    premium_subscription_count?: number;
    preferred_locale: string;
    public_updates_channel_id: ?snowflake;
    max_video_channel_users?: number;
    approximate_member_count: number;
    approximate_presence_count: number;
  }

  declare interface unavailable_guild {
    id: snowflake;
    unavailable: true;
  }

  declare interface team_member {
    membership_state: number;
    permissions: string[];
    team_id: snowflake;
    user: user;
  }

  declare interface team {
    icon: ?string;
    id: snowflake;
    members: team_member[];
    owner_user_id: snowflake;
  }

  declare interface application_object {
    id: snowflake;
    name: string;
    icon: ?string;
    description: string;
    rpc_origins?: string[];
    bot_public: boolean;
    bot_require_code_grant: boolean;
    owner: user;
    summary: string;
    verify_key: string;
    team: ?team;
    guild_id?: snowflake;
    primary_sku_id?: snowflake;
    slug?: string;
    cover_image?: string;
    flags: number;
  }

  declare interface ready {
    v: number;
    user: user;
    private_channels: [];
    guilds: unavailable_guild[];
    session_id: string;
    shard?: [number, number];
    application: application_object;
  }

  //messages
  declare interface embed_footer {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  }
  declare interface embed_image {
    url?: string; //source url of image (only supports http(s) and attachments)
    proxy_url?: string; //a proxied url of the image
    height?: integer; //height of image
    width?: integer; //width of image
  }
  declare interface embed_thumbnail {
    url?: string; //source url of thumbnail (only supports http(s) and attachments)
    proxy_url?: string; //a proxied url of the thumbnail
    height?: integer; //height of thumbnail
    width?: integer; //width of thumbnail
  }
  declare interface embed_video {
    url?: string; //source url of video
    height?: integer; //height of video
    width?: integer; //width of video
  }
  declare interface embed_provider {
    name?: string; //name of provider
    url?: string; //url of provider
  }
  declare interface embed_author {
    name?: string; // name of author
    url?: string; // url of author
    icon_url?: string; // url of author icon (only supports http(s) and attachments)
    proxy_icon_url?: string; // a proxied url of author icon
  }
  declare interface embed_field {
    name: string; // name of the field
    value: string; // value of the field
    inline?: boolean; // whether or not this field should display inline
  }
  declare interface embed {
    title?: string;
    type?: 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link';
    description?: string;
    url?: string;
    timestamp?: number;
    color?: number;
    footer?: embed_footer;
    image?: embed_image;
    thumbnail?: embed_thumbnail;
    video?: embed_video;
    provider?: embed_provider;
    author?: embed_author;
    fields?: embed_field[];
  }

  declare interface message_reference {
    message_id?: snowflake;
    channel_id?: snowflake;
    guild_id?: snowflake;
  }

  declare interface allowed_mentions {
    parse: allowed_mentions_types[]; // An array of allowed mention types to parse from the content.
    roles: snowflake[]; // Array of role_ids to mention (Max size of 100)
    users: snowflake[]; // Array of user_ids to mention (Max size of 100)
    replied_user: boolean; // For replies, whether to mention the author of the message being replied to (default false)
  }

  declare interface message_request {
    content: string; // the message contents (up to 2000 characters)
    nonce?: integer | string; // a nonce that can be used for optimistic message sending
    tts?: boolean; // true if this is a TTS message
    file?: file; // contents	the contents of the file being sent
    embed?: embed; // object	embedded rich content
    payload_json?: string; // JSON encoded body of any additional request fields.
    allowed_mentions?: allowed_mentions; // object	allowed mentions for a message
    message_reference?: message_reference; // include to make your message a reply
  }

  declare interface channel_mention {
    id: snowflake; // id of the channel
    guild_id: snowflake; // id of the guild containing the channel
    type: number; // the type of channel
    name: string; // the name of the channel
  }

  declare interface attachment {
    id: snowflake; // attachment id
    filename: string; // name of file attached
    size: number; // size of file in bytes
    url: string; // source url of file
    proxy_url: string; // a proxied url of file
    height: ?number; // height of file (if image)
    width: ?number; // width of file (if image)
  }

  declare interface reaction {
    count: number; // times this emoji has been used to react
    me: boolean; // whether the current user reacted using this emoji
    emoji: emoji; // emoji information
  }

  declare interface message_activity {
    type: number; // type of message activity
    party_id?: string; // party_id from a Rich Presence event
  }

  declare interface message_application {
    id: snowflake; // id of the application
    cover_image?: string; // id of the embed's image asset
    description: string; // application's description
    icon: ?string; // id of the application's icon
    name: string; // name of the application
  }

  declare interface message_reference {
    Field: Type; // Description
    message_id?: snowflake; // id of the originating message
    channel_id?: snowflake; // id of the originating message's channel
    guild_id?: snowflake; // id of the originating message's guild
  }

  declare interface sticker {
    id: snowflake; // id of the sticker
    pack_id: snowflake; // id of the pack the sticker is from
    name: string; // name of the sticker
    description: string; // description of the sticker
    tags?: string; // a comma-separated list of tags for the sticker
    asset: string; // sticker asset hash
    preview_asset: ?string; // sticker preview asset hash
    format_type: 1 | 2 | 3; // type of sticker format
  }

  declare interface message {
    id: snowflake; // id of the message
    channel_id: snowflake; // id of the channel the message was sent in
    guild_id?: snowflake; // id of the guild the message was sent in
    author: user; // the author of this message (not guaranteed to be a valid user, see below)
    member?: guild_member; // member properties for this message's author
    content: string; // contents of the message
    timestamp: number; // when this message was sent
    edited_timestamp: ?number; // when this message was edited (or null if never)
    tts: boolean; // whether this was a TTS message
    mention_everyone: boolean; // whether this message mentions everyone
    mentions: (user & member)[]; // users specifically mentioned in the message
    mention_roles: string[]; // roles specifically mentioned in this message
    mention_channels?: channel_mention[]; // channels specifically mentioned in this message
    attachments: attachment[]; // any attached files
    embeds: embed[]; // any embedded content
    reactions?: reaction[]; // reactions to the message
    nonce?: number | string; // used for validating a message was sent
    pinned: boolean; // whether this message is pinned
    webhook_id?: snowflake; // if the message is generated by a webhook, this is the webhook's id
    type: number; // type of message
    activity?: message_activity; // sent with Rich Presence-related chat embeds
    application?: message_application; // sent with Rich Presence-related chat embeds
    message_reference?: message_reference; // reference data sent with crossposted messages and replies
    flags?: integer; // message flags combined as a bitfield
    stickers?: sticker[]; // the stickers sent with the message (bots currently can only receive messages with stickers, not send)
    referenced_message?: ?message; // the message associated with the message_reference
  }

  declare interface message_reaction_add {
    user_id: snowflake; // the id of the user
    channel_id: snowflake; // the id of the channel
    message_id: snowflake; // the id of the message
    guild_id?: snowflake; // the id of the guild
    member?: guild_member; // the member who reacted if this happened in a guild
    emoji: emoji; // the emoji used to react - example
  }

  declare interface message_reaction_remove {
    user_id: snowflake; // the id of the user
    channel_id: snowflake; // the id of the channel
    message_id: snowflake; // the id of the message
    guild_id?: snowflake; // the id of the guild
    emoji: emoji; // the emoji used to react - example
  }

  //slash commands
  declare interface application_command_option_choice {
    name: string; // 1-100 character choice name
    value: string | number; // value of the choice
  }
  declare interface application_command_option {
    type: application_command_option_type; //value of ApplicationCommandOptionType
    name: string; //1-32 character name matching ^[\w-]{1,32}$
    description: string; //1-100 character description
    default?: boolean; //the first required option for the user to complete--only one option can be default
    required?: boolean; //if the parameter is required or optional--default false
    choices?: application_command_option_choice[]; //choices for string and int types for the user to pick from
    options?: application_command_option[]; //if the option is a subcommand or subcommand group type, this nested options will be the parameters
  }

  declare interface application_command {
    id?: snowflake; // unique id of the command
    application_id?: snowflake; // unique id of the parent application
    name: string; // 3-32 character name matching ^[\w-]{3,32}$
    description: string; // 1-100 character description
    options?: application_command_option[]; // the parameters for the command
  }

  declare interface application_command_interaction_data_option {
    name: string; // the name of the parameter
    value?: OptionType; // the value of the pair
    options?: application_command_interaction_data_option[]; // present if this option is a group or subcommand
  }

  declare interface application_command_interaction_data {
    id: snowflake; // the ID of the invoked command
    name: string; // the name of the invoked command
    options?: application_command_interaction_data_option[]; // the params + values from the user
  }

  declare interface interaction {
    id: snowflake; // id of the interaction
    type: 1 | 2; // the type of interaction
    data?: application_command_interaction_data; // the command data payload
    guild_id: snowflake; // the guild it was sent from
    channel_id: snowflake; // the channel it was sent from
    member: guild_member; // guild member data for the invoking user
    token: string; // a continuation token for responding to the interaction
    version: number; // read-only property, always 1
  }

  declare interface interaction_application_command_callback_data {
    tts?: bool; // is the response TTS
    content: string; // message content
    embeds?: embed[]; // supports up to 10 embeds
    allowed_mentions?: allowed_mentions; // allowed mentions object
    flags?: 64; //set to 64 to make your response ephemeral
  }

  declare interface interaction_response {
    type: 1 | 4 | 5; // the type of response
    data?: interaction_application_command_callback_data; // an optional response message
  }

  declare interface edit_webhook_message_request {
    content: string; //	the message contents (up to 2000 characters)
    embeds?: embed[]; //	array of up to 10 embed objects	embedded rich content
    allowed_mentions?: allowed_mentions; // allowed mentions for the message
  }
}
