export enum MediaType {
  ANIME = "ANIME",
  MANGA = "MANGA"
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
  ONE_SHOT = "ONE_SHOT"
}
export enum MediaStatus {
  FINISHED = "FINISHED",
  RELEASING = "RELEASING",
  NOT_YET_RELEASED = "NOT_YET_RELEASED",
  CANCELLED = "CANCELLED",
  HIATUS = "HIATUS"
}
export enum MediaSeason {
  WINTER = "WINTER",
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL"
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
  PICTURE_BOOK = "PICTURE_BOOK"
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
  CONTAINS = "CONTAINS"
}

interface ExternalLinks {
  url: string;
  site: string;
}

export interface NextEpisode {
  id?: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}

interface Name {
  name: string;
}

export interface Nodes<T> {
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

export interface MediaCoverImage {
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

export interface Trailer {
  id: string;
  site: string;
  thumbnail: string;
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
  countryOfOrigin: string;
  source: MediaSource | null;
  trailer: Trailer | null;
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

export interface MediaList<T = Media> {
  media: T[];
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

interface NextAiringEpisode {
  nextAiringEpisode: NextEpisode | null;
}

export interface NextAiring extends NextAiringEpisode {
  airingSchedule: Nodes<NextEpisode>;
}
export interface MediaForAiring {
  id: number;
  title: MediaTitle;
  isAdult: boolean;
  airingSchedule: Nodes<NextEpisode>;
  coverImage: MediaCoverImage;
  siteUrl: string;
}
export type NextAiringWithTitle = MediaForAiring & NextAiring;

export interface InfoWithSchedule {
  id: number;
  status: MediaStatus;
  title: MediaTitle;
  isAdult: boolean;
  coverImage: MediaCoverImage;
  siteUrl: string;
  airingSchedule: Nodes<NextEpisode>;
}

export interface MediaSubbedInfo extends NextAiringEpisode {
  id: string;
  title: MediaTitle;
  siteUrl: string;
}

export interface MediaSubbed {
  media: MediaSubbedInfo[];
}

export interface PageResponse<T> {
  Page: Page<T>;
}

export interface AiringSchedule {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  mediaId: number;
  media: MediaForAiring;
}

export interface MediaResponse<T> {
  Media: T;
}

export interface AiringScheduleResponse {
  AiringSchedule: AiringSchedule;
}

export interface Response<T> {
  data: T;
}

export type UpcomingMedia = MediaList<
  Pick<
    Media,
    | "id"
    | "idMal"
    | "title"
    | "format"
    | "description"
    | "startDate"
    | "episodes"
    | "duration"
    | "countryOfOrigin"
    | "source"
    | "trailer"
    | "updatedAt"
    | "coverImage"
    | "genres"
    | "studios"
    | "isAdult"
    | "nextAiringEpisode"
    | "externalLinks"
    | "siteUrl"
  > & {
    tags: { name: string;
      isMediaSpoiler: boolean; }[];
  }
>;
