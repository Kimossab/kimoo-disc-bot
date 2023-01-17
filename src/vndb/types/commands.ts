import * as filters from "./filters";
import { flags } from "./vndb";

// login
export interface login {
  command: "login";
  data: {
    protocol: 1;
    client: string;
    clientver: string;
    username?: string;
    password?: string;
  };
}

// get
export interface base_options {
  page?: number;
  results?: number;
  sort?: string;
  reverse?: boolean;
}

export interface base_get {
  command: "get";
}

// get vn
export type get_vn_flags =
  | flags.basic
  | flags.details
  | flags.anime
  | flags.relations
  | flags.tags
  | flags.stats
  | flags.screens
  | flags.staff;

export type get_vn_filters = { join?: "AND" | "OR" } & (
  | filters.id
  | filters.title
  | filters.original
  | filters.first_char
  | filters.released
  | filters.platforms
  | filters.languages
  | filters.orig_lang
  | filters.search
  | filters.tags
);

export type get_vn = base_get & {
  type: "vn";
  flags: get_vn_flags[];
  filters: get_vn_filters[];
  options?: base_options & {
    sort: "id" | "title" | "released" | "popularity" | "rating" | "votecount";
  };
};

export type get = base_get & get_vn;

export type command = login | get;
