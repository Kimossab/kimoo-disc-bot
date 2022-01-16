declare module "puppeteer-bypass";

interface string_object<T> {
  [index: string]: T;
}

type CommandHandler = (
  data: Interaction,
  option: CommandInteractionDataOption
) => Promise<void>;
type SingleCommandHandler = (
  data: Interaction
) => Promise<void>;

declare interface command_list {
  list: discord.application_command[];
  version: string;
}

declare namespace mal {
  declare interface character {
    related_works: string[];
    favorites: number;
  }

  declare interface manga {
    media_type: string;
    start_year: number;
    published: string;
    score: string;
    status: string;
  }

  declare interface anime {
    media_type: string;
    start_year: number;
    aired: string;
    score: string;
    status: string;
  }

  declare interface person {
    alternative_name: string;
    birthday: string;
    favorites: number;
  }

  declare interface item {
    id: number;
    type: string;
    name: string;
    url: string;
    image_url: string;
    thumbnail_url: string;
    payload: character | manga | anime | person;
    es_score: number;
  }

  declare interface request_item {
    type: string;
    items: item[];
  }

  declare interface request {
    categories: request_item[];
  }
}

declare namespace SauceNao {
  interface index_response {
    status: number;
    parent_id: number;
    id: number;
    results: number;
  }

  interface response_header {
    user_id: string;
    account_type: string;
    short_limit: string;
    long_limit: string;
    long_remaining: number;
    short_remaining: number;
    status: number;
    results_requested: number;
    index: string_object<index_response>;
    search_depth: string;
    minimum_similarity: number;
    query_image_display: string;
    query_image: string;
    results_returned: 6;
  }

  interface result_header {
    similarity: string;
    thumbnail: string;
    index_id: number;
    index_name: string;
  }

  interface result_data {
    ext_urls: string[];
    title: string;
    da_id: number;
    author_name: string;
    author_url: string;
    anidb_aid?: string;
    bcy_id?: string;
    bcy_type?: string;
    danbooru_id?: string;
    ddb_id?: string;
    drawr_id?: string;
    e621_id?: string;
    file?: string;
    gelbooru_id?: string;
    idol_id?: string;
    imdb_id?: string;
    konachan_id?: string;
    member_link_id?: string;
    mu_id?: string;
    nijie_id?: string;
    pawoo_id?: string;
    pg_id?: string;
    pixiv_id?: string;
    sankaku_id?: string;
    seiga_id?: string;
    source?: string;
    url?: string;
    user_acct?: string;
    yandere_id?: string;
    "anime-pictures_id"?: string;
    member_id?: string;
    member_name?: string;
    creator?: string | string[];
    material?: string;
    pawoo_user_display_name?: string;
    eng_name?: string;
    jp_name?: string;
    tweet_id?: string;
    twitter_user_id?: string;
    twitter_user_handle?: string;
    md_id?: string;
    mu_id?: number;
    mal_id?: string;
    part?: string;
    artist?: string;
    author?: string;
  }

  interface result {
    header: result_header;
    data: result_data;
  }

  interface response {
    header: response_header;
    results: result[];
  }

  interface author_data {
    authorName: string | null;
    authorUrl: string | null;
  }

  interface data {
    name: string;
    site: string;
    index: number;
    similarity: number;
    authorData: author_data | null;
    thumbnail: string | null;
    url: string[] | null;
    fallback?: string;
  }

  interface message_list {
    message: string;
    items: Embed[];
    currentPage: number;
  }
}

declare namespace TraceMoe {
  // declare interface doc {
  //   from: number;
  //   to: number;
  //   anilist_id: number;
  //   at: number;
  //   season: string;
  //   anime: string;
  //   filename: string;
  //   episode: number;
  //   tokenthumb: string;
  //   similarity: number;
  //   title: string;
  //   title_native: string;
  //   title_chinese: string;
  //   title_english: string;
  //   title_romaji: string;
  //   mal_id: number;
  //   synonyms: string[];
  //   synonyms_chinese: string[];
  //   is_adult: boolean;
  // }

  // declare interface response {
  //   RawDocsCount: number;
  //   RawDocsSearchTime: number;
  //   ReRankSearchTime: number;
  //   CacheHit: boolean;
  //   trial: number;
  //   limit: number;
  //   limit_ttl: number;
  //   quota: number;
  //   quota_ttl: number;
  //   docs: doc[];
  // }

  declare interface anilistData {
    id: number;
    idMal: number;
    isAdult: boolean;
    synonyms: string[];
    synonyms_chinese: string[];
    title: {
      native: null | string;
      romaji: null | string;
      english: null | string;
      chinese: null | string;
    };
  }

  declare interface resultData {
    anilist: anilistData;
    filename: string;
    episode: null | number;
    from: number;
    to: number;
    similarity: number;
    video: string;
    image: string;
  }

  declare interface response {
    frameCount: number;
    error: string;
    result: resultData[];
  }
}

declare namespace achievement {
  interface serverLeaderboard {
    user: string;
    points: number;
    rank: string;
  }
}

declare type Nullable<T> = T | null | undefined;

declare interface DayInfo {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}
