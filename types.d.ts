declare module "*.json" {
  const value: any;
  export default value;
}

declare module "unirest";

declare interface string_object<T> {
  [index: string]: T
}

declare type any_function = (...args: any[]) => any;

declare interface custom_commands {
  id: number;
  server_id: string;
  cmd_trigger: string;
  text: string;
  file_id: string;
  path?: string; //image path
}

declare interface message_translate {
  key: string;
  replaces?: string_object<string>;
}

declare namespace database {
  interface server_settings {
    server_id: string;
    cmd_trigger?: string | null;
    admin_role: string | null;
    bot_lang: string;
  }

  interface birthday {
    user_id: string,
    day: number,
    month: number,
    year: number | null
  }

  interface birthday_settings {
    server_id: string,
    hours: number,
    channel: string
  }

  interface anime_settings {
    server_id: string,
    channel: string
  }

  interface server_data {
    settings: server_settings,
    birthdays: birthday[],
    birthday_settings: birthday_settings | null
  }
  interface anime_subscription {
    server_id: string,
    user_id: string,
    anime_id: number
  }
}

declare namespace discord {
  namespace gateway {
    interface payload {
      op: number;
      d: any | null;
      s?: number;
      t?: string;
    }

    interface session_start_limit {
      total: number;
      remaining: number;
      reset_after: number;
    }

    interface bot {
      url: string;
      shards: number;
      session_start_limit: session_start_limit;
    }
  }

  interface role {
    id: string;
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: number;
    managed: boolean;
    mentionable: boolean;
  }

  interface user {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
    mfa_enabled?: boolean;
    locale?: string;
    verified?: boolean;
    email?: string;
    flags?: number;
    premium_type?: number;
  }

  interface emoji {
    id: string | null;
    name: string;
    roles?: string[];
    user?: discord.user;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
  }

  interface voice_state {
    guild_id?: string;
    channel_id: string | null;
    user_id: string;
    member?: discord.member;
    session_id: string;
    deaf: boolean;
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    suppress: boolean;
  }

  interface member {
    user: discord.user;
    nick?: string;
    roles: string[];
    joined_at: string;
    premium_since: string | null;
    deaf: boolean;
    mute: boolean;
  }

  interface overwrite {
    id: string;
    type: string;
    allow: number;
    deny: number;
  }

  interface channel {
    id: string;
    type: number;
    guild_id?: string;
    position?: number;
    permission_overwrites?: discord.overwrite[];
    name?: string;
    topic?: string | null;
    nsfw?: boolean;
    last_message_id?: string | null;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    recipients?: discord.user[];
    icon?: string | null;
    owner_id?: string;
    application_id?: string;
    parent_id?: string | null;
    last_pin_timestamp?: string;
  }

  interface timestamps {
    start?: number;
    end?: number;
  }

  interface party {
    id?: string;
    size?: number[];
  }

  interface assets {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  }

  interface secrets {
    join?: string;
    spectate?: string;
    match?: string;
  }

  interface activity {
    name: string;
    type: number;
    url?: string | null;
    timestamps?: discord.timestamps;
    application_id?: string;
    details?: string | null;
    state?: string | null;
    party?: discord.party;
    assets?: discord.assets;
    secrets?: discord.secrets;
    instance?: boolean;
    flags?: number;
  }

  interface client_status {
    desktop?: string;
    mobile?: string;
    web?: string;
  }

  interface presence {
    user: discord.user;
    roles: string[];
    game: discord.activity | null;
    guild_id: string;
    status: string;
    activities: discord.activity[];
    client_status: discord.client_status;
  }

  interface guild {
    id: string;
    name: string;
    icon: string | null;
    splash: string | null;
    discovery_splash: string | null;
    owner?: boolean;
    owner_id: string;
    permissions?: number;
    region: string;
    afk_channel_id: string | null;
    afk_timeout: number;
    embed_enabled?: boolean;
    embed_channel_id?: string;
    verification_level: number;
    default_message_notifications: number;
    explicit_content_filter: number;
    roles: discord.role[];
    emojis: discord.emoji[];
    features: string[];
    mfa_level: number;
    application_id: string | null;
    widget_enabled?: boolean;
    widget_channel_id?: string;
    system_channel_id: string | null;
    system_channel_flags: number;
    rules_channel_id: string | null;
    joined_at?: string;
    large?: boolean;
    unavailable?: boolean;
    member_count?: number;
    voice_states?: discord.voice_state[];
    members?: discord.member[];
    channels?: discord.channel[];
    presences?: discord.presence[];
    max_presences?: number | null;
    max_members?: number;
    vanity_url_code: string | null;
    description: string | null;
    banner: string | null;
    premium_tier: number;
    premium_subscription_count?: number;
    preferred_locale: string;
    public_updates_channel_id: string | null;
    max_video_channel_users?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;

    settings: database.server_settings,
    birthdays: database.birthday[],
    birthday_settings: database.birthday_settings
  }

  interface attachment {
    id: string;
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    height: number | null;
    width: number | null;
  }

  interface embed_footer {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  }

  interface embed_image {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  }

  interface embed_thumbnail {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  }

  interface embed_video {
    url?: string;
    height?: number;
    width?: number;
  }

  interface embed_provider {
    name?: string;
    url?: string;
  }

  interface embed_author {
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  }

  interface embed_field {
    name: string;
    value: string;
    inline?: boolean;
  }

  interface embed {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: discord.embed_footer;
    image?: discord.embed_image;
    thumbnail?: discord.embed_thumbnail;
    video?: discord.embed_video;
    provider?: discord.embed_provider;
    author?: discord.embed_author;
    fields?: discord.embed_field[];
  }

  interface reaction {
    count: number;
    me: boolean;
    emoji: discord.emoji;
  }

  interface message_activity {
    type: number;
    party_id?: string;
  }

  interface message_application {
    id: string;
    cover_image?: string;
    description: string;
    icon: string | null;
    name: string;
  }

  interface message_reference {
    message_id?: string;
    channel_id: string;
    guild_id?: string;
  }

  interface message {
    id: string;
    channel_id: string;
    guild_id?: string;
    author: discord.user | any;
    member?: discord.member;
    content: string;
    timestamp: string;
    edited_timestamp: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: any[];
    mention_roles: role[] | string[];
    attachments: discord.attachment[];
    embeds: discord.embed[];
    reactions?: discord.reaction[];
    nonce?: string | null;
    pinned: boolean;
    webhook_id?: string;
    type: number;
    activity?: discord.message_activity;
    application?: discord.message_application;
    message_reference?: discord.message_reference;
    flags?: number;
  }
}

declare namespace kitsu {
  interface anime {
    id: string;
    type: string;
    links: { self: string };
    attributes: anime_attributes;
    relationships: object;
  }

  interface anime_attributes {
    createdAt: string;
    updatedAt: string;
    slug: string;
    synopsis: string;
    coverImageTopOffset: number;
    titles: object;
    canonicalTitle: string;
    abbreviatedTitles: string[];
    averageRating: string;
    ratingFrequencies: object;
    userCount: number;
    favoritesCount: number;
    startDate: string;
    endDate: string;
    nextRelease: string | null;
    popularityRank: number;
    ratingRank: number;
    ageRating: string;
    ageRatingGuide: string;
    subtype: string;
    status: string;
    tba: string | null;
    posterImage: object;
    episodeCount: number;
    episodeLength: number;
    totalLength: number;
    youtubeVideoId: string;
    showType: string;
    nsfw: boolean;
  }

  interface search_response {
    data: anime[];
    meta: { count: number };
    links: {
      first: string;
      next: string;
      last: string;
    };
  }

  interface cache {
    query: string;
    response: search_response;
  }
}

declare namespace MAL {
  interface search_response {
    categories: search_categories[];
  }
  interface search_categories {
    type: string;
    items: item[];
  }
  interface item {
    id: number;
    type: string;
    name: string;
    url: string;
    image_url: string;
    thumbnail_url: string;
    payload: anime_payload | char_payload;
    es_score: number;
  }
  interface anime_payload {
    media_type: string;
    start_year: number;
    aired?: string;
    published?: string;
    score: string;
    status: string;
  }
  interface char_payload {
    related_works: string[];
    favorites: number
  }
  interface cache {
    type: string;
    query: string;
    response: item[];
  }
  interface message_list {
    message: string,
    items: item[],
    currentPage: number
  }
}

declare namespace fandom {
  interface url_map {
    [index: string]: string
  }

  interface search_item {
    quality: number,
    url: string,
    ns: number,
    id: number,
    title: string,
    snippet: string
  }

  interface search_response {
    batches: number,
    items: search_item[],
    total: number,
    currentBatch: number,
    next: number
  }

  interface dimensions {
    width: number,
    height: number
  }

  interface page_revision {
    id: number,
    user: string,
    user_id: number,
    timestamp: number
  }

  interface page_item {
    original_dimensions: dimensions,
    url: string,
    ns: number,
    abstract: string,
    thumbnail: string,
    revision: page_revision,
    id: number,
    title: string,
    type: string,
    comments: number
  }

  interface page_item_list {
    [index: string]: page_item
  }

  interface page {
    items: page_item_list,
    basepath: string
  }

  interface message_list {
    message: string,
    fandom: string,
    articles: fandom.search_response,
    currentPage: number
  }

  interface query_cache {
    fandom: string,
    query: string,
    result: fandom.search_response
  }

  interface page_cache {
    fandom: string,
    id: number,
    page: page
  }
}

declare namespace SauceNao {
  interface index_response {
    status: number,
    parent_id: number,
    id: number,
    results: number
  }

  interface response_header {
    user_id: string,
    account_type: string,
    short_limit: string,
    long_limit: string,
    long_remaining: number,
    short_remaining: number,
    status: number,
    results_requested: number,
    index: string_object<index_response>,
    search_depth: string,
    minimum_similarity: number,
    query_image_display: string,
    query_image: string,
    results_returned: 6
  }

  interface result_header {
    similarity: string,
    thumbnail: string,
    index_id: number,
    index_name: string
  }

  interface result_data {
    ext_urls: string[],
    title: string,
    da_id: number,
    author_name: string,
    author_url: string,
    anidb_aid?: string,
    bcy_id?: string,
    bcy_type?: string,
    danbooru_id?: string,
    ddb_id?: string,
    drawr_id?: string,
    e621_id?: string,
    file?: string,
    gelbooru_id?: string,
    idol_id?: string,
    imdb_id?: string,
    konachan_id?: string,
    member_link_id?: string,
    mu_id?: string,
    nijie_id?: string,
    pawoo_id?: string,
    pg_id?: string,
    pixiv_id?: string,
    sankaku_id?: string,
    seiga_id?: string,
    source?: string,
    url?: string,
    user_acct?: string,
    yandere_id?: string,
    "anime-pictures_id"?: string,
    member_id?: string,
    member_name?: string,
    creator?: string | string[],
    material?: string,
    pawoo_user_display_name?: string,
    eng_name?: string,
    jp_name?: string
  }

  interface result {
    header: result_header,
    data: result_data
  }

  interface response {
    header: response_header,
    results: result[]
  }

  interface author_data {
    authorName: string | null,
    authorUrl: string | null,
  }

  interface data {
    name: string,
    site: string,
    index: number,
    similarity: number,
    authorData: author_data | null,
    thumbnail: string | null,
    url: string[] | null,
    fallback?: string
  }

  interface message_list {
    message: string,
    items: data[],
    currentPage: number
  }
}