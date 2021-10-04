export enum MediaType {
  ANIME = "ANIME",
  MANGA = "MANGA",
}
export enum MediaFormat {
  TV = "TV",
  TV_SHORT = "TV_SHORT",
  MOVIE = "MOVIE",
  SPECIAL = "SPECIAL",
  OVA = "OVA",
  ONA = "ONA",
  MUSIC = "MUSIC",
  MANGA = "MANGA",
  NOVEL = "NOVEL",
  ONE_SHOT = "ONE_SHOT",
}
export enum MediaStatus {
  FINISHED = "FINISHED",
  RELEASING = "RELEASING",
  NOT_YET_RELEASED = "NOT_YET_RELEASED",
  CANCELLED = "CANCELLED",
  HIATUS = "HIATUS",
}
export enum MediaSeason {
  WINTER = "WINTER",
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
}
export enum MediaSource {
  ORIGINAL = "ORIGINAL",
  MANGA = "MANGA",
  LIGHT_NOVEL = "LIGHT_NOVEL",
  VISUAL_NOVEL = "VISUAL_NOVEL",
  VIDEO_GAME = "VIDEO_GAME",
  OTHER = "OTHER",
  Other = "Other",
  NOVEL = "NOVEL",
  DOUJINSHI = "DOUJINSHI",
  ANIME = "ANIME",
  WEB_NOVEL = "WEB_NOVEL",
  LIVE_ACTION = "LIVE_ACTION",
  GAME = "GAME",
  COMIC = "COMIC",
  MULTIMEDIA_PROJECT = "MULTIMEDIA_PROJECT",
  PICTURE_BOOK = "PICTURE_BOOK",
}

export enum MediaRelationType {
  ADAPTATION = "ADAPTATION",
  PREQUEL = "PREQUEL",
  SEQUEL = "SEQUEL",
  PARENT = "PARENT",
  SIDE_STORY = "SIDE_STORY",
  CHARACTER = "CHARACTER",
  SUMMARY = "SUMMARY",
  ALTERNATIVE = "ALTERNATIVE",
  SPIN_OFF = "SPIN_OFF",
  OTHER = "OTHER",
  SOURCE = "SOURCE",
  COMPILATION = "COMPILATION",
  CONTAINS = "CONTAINS",
}

interface ExternalLinks {
  url: string;
  site: string;
}

interface NextEpisode {
  id?: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}

interface Name {
  name: string;
}

interface Nodes<T> {
  nodes: T[] | null;
}

interface RelationMedia {
  title: MediaTitle;
  format: MediaFormat;
  siteUrl: string;
}

interface Edges<T> {
  edges: {
    node: T;
  }[];
}

interface RelationEdges<T> {
  edges: {
    node: T;
    relationType: MediaRelationType;
  }[];
}

interface MediaCoverImage {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
}

export interface Date {
  year: number;
  month: number;
  day: number;
}

interface MediaTitle {
  romaji: string;
  english: string;
  native: string;
  userPreferred: string;
}

interface Media {
  id: number;
  idMal: number | null;
  title: MediaTitle;
  type: MediaType;
  format: MediaFormat;
  status: MediaStatus;
  description: string;
  startDate: Date;
  endDate: Date;
  season: MediaSeason | null;
  episodes: number | null;
  duration: number | null;
  volumes: number | null;
  isLicensed: boolean;
  source: MediaSource | null;
  updatedAt: number;
  coverImage: MediaCoverImage;
  genres: string[] | null;
  averageScore: number | null;
  tags: Name[];
  relations: RelationEdges<RelationMedia>;
  studios: Nodes<Name> | null;
  isAdult: boolean;
  nextAiringEpisode: NextEpisode | null;
  airingSchedule: Edges<NextEpisode>;
  externalLinks: ExternalLinks[] | null;
  siteUrl: string;
}

export interface MediaList {
  media: Media[];
}

interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

type Page<T> = {
  pageInfo: PageInfo;
} & T;

export interface MediaForAiring {
  id: number;
  title: MediaTitle;
  isAdult: boolean;
  nextAiringEpisode: NextEpisode | null;
  airingSchedule?: Edges<NextEpisode> | null;
  coverImage: MediaCoverImage;
  siteUrl: string;
}

export interface MediaSubbedInfo {
  title: MediaTitle;
  siteUrl: string;
}

export interface MediaSubbed {
  media: MediaSubbedInfo[];
}

export interface PageResponse<T> {
  Page: Page<T>;
}

export interface MediaResponse<T> {
  Media: Page<T>;
}

export interface Response<T> {
  data: T;
}
