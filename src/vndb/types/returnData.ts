import { sexual, violence } from "./vndb";

export interface image_flagging {
  votecount: number;
  sexual_avg: sexual | null;
  violence_avg: null | violence;
}

export type data<T> = {
  more: boolean;
  num: number;
  items: T[];
};

export interface get_vn {
  id: number;
}

export interface get_vn_basic {
  title: string;
  original: null | string;
  released: null | string;
  languages: string[];
  orig_lang: string[];
  platforms: string[];
}

export interface get_vn_details {
  aliases: null | string;
  length: null | number;
  description: null | string;
  links: {
    wikipedia: null | string /** @deprecated * */;
    encubed: null | string /** @deprecated * */;
    renai: null | string;
    wikidata: null | string;
  };
  image: null | string;
  image_nsfw: boolean /** @deprecated * */;
  image_flagging: null | image_flagging;
}

export interface get_vn_anime {
  anime: {
    id: number;
    ann_id: null | number;
    nfo_id: null | string;
    title_romanji: null | string;
    title_kanji: null | string;
    year: null | number;
    type: null | string;
  }[];
}

export interface get_vn_single_relation {
  id: number;
  relation: string;
  title: string;
  original: null | string;
  official: boolean;
}

export interface get_vn_relations {
  relations: get_vn_single_relation[];
}

export interface get_vn_tags {
  tags: number[][];
  /**
   *  	(Possibly empty) list of tags linked to this VN. Each tag is represented as an array with three elements:
        tag id (integer),
        score (number between 0 and 3),
        spoiler level (integer, 0=none, 1=minor, 2=major)
        Only tags with a positive score are included. Note that this list may be relatively large -
        more than 50 tags for a VN is quite possible.
        General information for each tag is available in the tags dump. Keep in mind that it is possible that a tag
        has only recently been added and is not available in the dump yet, though this doesn't happen often.
   */
}

export interface get_vn_stats {
  popularity: number;
  rating: number;
  votecount: number;
}

export interface get_vn_screens {
  screens: {
    image: string;
    rid: number;
    nsfw: boolean;
    flagging: null | image_flagging;
    height: number;
    width: number;
  }[];
}

export interface get_vn_staff {
  staff: {
    sid: number;
    aid: number;
    name: string;
    original: null | string;
    role: string;
    note: null | string;
  }[];
}
