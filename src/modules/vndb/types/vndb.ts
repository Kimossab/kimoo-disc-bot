export type lowercase_char =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export const LENGTH_TYPE: Record<string, string> = {
  1: "Very short (< 2 hours)",
  2: "Short (2 - 10 hours)",
  3: "Medium (10 - 30 hours)",
  4: "Long (30 - 50 hours)",
  5: "Very long (> 50 hours)",
};

export const RELATION_TYPES: Record<string, string> = {
  ser: "Same series",
  preq: "Prequel",
  seq: "Sequel",
  fan: "Fandisc",
  char: "Shares characters",
  set: "Same setting",
  side: "Side story",
  alt: "Alternative version",
  orig: "Original game",
  par: "Parent story",
};

export enum operators {
  equal = "=",
  not_equal = "!=",
  greater = ">",
  greater_or_equal = ">=",
  less = "<",
  less_or_equal = "<=",
  like = "~",
}

export enum flags {
  basic = "basic",
  details = "details",
  anime = "anime",
  relations = "relations",
  tags = "tags",
  stats = "stats",
  screens = "screens",
  staff = "staff",
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

export type queue_callback = (data: string | null) => void;

export interface queue {
  command: Buffer;
  callback: queue_callback;
}
