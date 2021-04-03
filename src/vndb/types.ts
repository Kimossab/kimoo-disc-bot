export type lowercase_char =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

export const LENGTH_TYPE: string_object<string> = {
  1: 'Very short (< 2 hours)',
  2: 'Short (2 - 10 hours)',
  3: 'Medium (10 - 30 hours)',
  4: 'Long (30 - 50 hours)',
  5: 'Very long (> 50 hours)',
};

export const RELATION_TYPES: string_object<string> = {
  ser: 'Same series',
  preq: 'Prequel',
  seq: 'Sequel',
  fan: 'Fandisc',
  char: 'Shares characters',
  set: 'Same setting',
  side: 'Side story',
  alt: 'Alternative version',
  orig: 'Original game',
  par: 'Parent story',
};

export enum operators {
  equal = '=',
  not_equal = '!=',
  greater = '>',
  greater_or_equal = '>=',
  less = '<',
  less_or_equal = '<=',
  like = '~',
}

export namespace VNDB {
  export enum flags {
    basic = 'basic',
    details = 'details',
    anime = 'anime',
    relations = 'relations',
    tags = 'tags',
    stats = 'stats',
    screens = 'screens',
    staff = 'staff',
  }

  export enum sexual {
    safe = 0,
    average = 1,
    explicit = 2,
  }

  export enum violence {
    tame = 0,
    mild = 1,
    brutal = 2,
  }

  export namespace filters {
    export type id = { field: 'id' } & (
      | {
          operator:
            | operators.equal
            | operators.not_equal
            | operators.greater
            | operators.greater_or_equal
            | operators.less
            | operators.less_or_equal;
          value: number;
        }
      | {
          operator: operators.equal | operators.not_equal;
          value: number[];
        }
    );

    export type title = {
      field: 'title';
      operator: operators.equal | operators.not_equal | operators.like;
      value: string;
    };

    export type original = {
      field: 'original';
    } & (
      | {
          operator: operators.equal | operators.not_equal;
          value: null;
        }
      | {
          operator: operators.equal | operators.not_equal | operators.like;
          value: string;
        }
    );

    export type first_char = {
      field: 'firstchar';
      operator: operators.equal | operators.not_equal;
      value: null | lowercase_char;
    };

    export type released = {
      field: 'released';
    } & (
      | {
          operator: operators.equal | operators.not_equal;
          value: null;
        }
      | {
          operator:
            | operators.equal
            | operators.not_equal
            | operators.greater
            | operators.greater_or_equal
            | operators.less
            | operators.less_or_equal;
          value: string;
        }
    );

    export type platforms = {
      field: 'platforms';
      operator: operators.equal | operators.not_equal;
      value: null | string | string[];
    };

    export type languages = {
      field: 'languages';
      operator: operators.equal | operators.not_equal;
      value: null | string | string[];
    };

    export type orig_lang = {
      field: 'orig_lang';
      operator: operators.equal | operators.not_equal;
      value: string | string[];
    };

    export type search = {
      field: 'search';
      operator: operators.like;
      value: string;
    };

    export type tags = {
      field: 'tags';
      operator: operators.equal | operators.not_equal;
      value: number | number[];
    };
  }

  export namespace return_data {
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
        wikipedia: null | string /** @deprecated **/;
        encubed: null | string /** @deprecated **/;
        renai: null | string;
        wikidata: null | string;
      };
      image: null | string;
      image_nsfw: boolean /** @deprecated **/;
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
            Only tags with a positive score are included. Note that this list may be relatively large - more than 50 tags for a VN is quite possible.
            General information for each tag is available in the tags dump. Keep in mind that it is possible that a tag has only recently been added and is not available in the dump yet, though this doesn't happen often.
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
  }

  export namespace commands {
    // login
    export interface login {
      command: 'login';
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
      command: 'get';
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

    export type get_vn_filters = { join?: 'AND' | 'OR' } & (
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
      type: 'vn';
      flags: get_vn_flags[];
      filters: get_vn_filters[];
      options?: base_options & {
        sort:
          | 'id'
          | 'title'
          | 'released'
          | 'popularity'
          | 'rating'
          | 'votecount';
      };
    };

    export type get = base_get & get_vn;

    export type command = login | get;
  }

  export type queue_callback = (data: string | null) => void;

  export interface queue {
    command: Buffer;
    callback: queue_callback;
  }
}
