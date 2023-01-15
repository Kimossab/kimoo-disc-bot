import {
  MediaFormat,
  MediaRelationType,
  MediaSeason,
  MediaSource,
  MediaStatus,
  MediaType,
} from "../types/graphql";

export const typeMapper: {
  [key in keyof typeof MediaType]: string;
} = {
  [MediaType.ANIME]: "Anime",
  [MediaType.MANGA]: "Manga",
};

export const formatMapper: {
  [key in keyof typeof MediaFormat]: string;
} = {
  MANGA: "Manga",
  MOVIE: "Movie",
  MUSIC: "Music",
  NOVEL: "Novel",
  ONA: "ONA",
  ONE_SHOT: "One shot",
  OVA: "OVA",
  SPECIAL: "Special",
  TV: "TV",
  TV_SHORT: "TV short",
};

export const statusMapper: {
  [key in keyof typeof MediaStatus]: string;
} = {
  CANCELLED: "Cancelled",
  FINISHED: "Finished",
  HIATUS: "Hiatus",
  NOT_YET_RELEASED: "Not yet released",
  RELEASING: "Releasing",
};

export const seasonMapper: {
  [key in keyof typeof MediaSeason]: string;
} = {
  WINTER: "Winter",
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

export const sourceMapper: {
  [key in keyof typeof MediaSource]: string;
} = {
  ORIGINAL: "Original",
  MANGA: "Manga",
  LIGHT_NOVEL: "Light Novel",
  VISUAL_NOVEL: "Visual Novel",
  VIDEO_GAME: "Video Game",
  OTHER: "Other",
  Other: "Other",
  NOVEL: "Novel",
  DOUJINSHI: "Doujinshi",
  ANIME: "Anime",
  WEB_NOVEL: "Web Novel",
  LIVE_ACTION: "Live Action",
  GAME: "Game",
  COMIC: "Comic",
  MULTIMEDIA_PROJECT: "Multimedia Project",
  PICTURE_BOOK: "Picture Book",
};

export const relationMapper: {
  [key in keyof typeof MediaRelationType]: string;
} = {
  ADAPTATION: "Adaptation",
  PREQUEL: "Prequel",
  SEQUEL: "Sequel",
  PARENT: "Parent Story",
  SIDE_STORY: "Side Story",
  CHARACTER: "Shares Characters",
  SUMMARY: "Summary",
  ALTERNATIVE: "Alternative Story",
  SPIN_OFF: "Spin Off",
  OTHER: "Other",
  SOURCE: "Source",
  COMPILATION: "Compilation",
  CONTAINS: "Contains",
};
