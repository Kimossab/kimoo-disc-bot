import { AllowedMentions } from "../types/discord";

// common
export const PRESENCE_STRINGS: `:${string}: ${string}`[] = [
  ":thinking: Doing witchy things",
  ":thinking: It's not that I know everything, I just know what I know",
  ":thinking: El Psy Kongroo",
  ":thinking: Tuturu",
  ":thinking: I'm working, I suppose",
  ":thinking: Shitsurei, kamimashita",
  ":thinking: 01001000 01100101 01101100 01101100 01101111 00100000 01110111 01101111 01110010 01101100 01100100",
  ":thinking: Who's that cute witch flying in this summer sky? That's right, it's me, Elaina",
  ":thinking: EMT",
  ":thinking: Who's Rem?",
  ":thinking: As you like my pleasure",
  ":thinking: Sono me, dare no me?",
  ":thinking: Whose eyes are those?",
  ":thinking: NullPo... Gah!",
  ":thinking: Let us carry out the Singularity Project",
  ":thinking: As you like my pleasure",
];

enum colors {
  black = 0,
  red = 1,
  green = 2,
  yellow = 3,
  blue = 4,
  magenta = 5,
  cyan = 6,
  white = 7,
}

// fandom
export const FANDOM_LINKS: Record<string, string> = {
  // Sword Art Online
  sao: "swordartonline",
  // Accel World
  aw: "accelworld",
  // The Irregular At Magic High School
  magichighschool: "mahouka-koukou-no-rettousei",
  magichs: "mahouka-koukou-no-rettousei",
  mahouka: "mahouka-koukou-no-rettousei",
  irregular: "mahouka-koukou-no-rettousei",
  // Re:Zero
  rezero: "rezero",
  // Overlord
  overlord: "overlordmaruyama",
  // Quintessential Quintuplets
  quintuplets: "5hanayome",
  "5toubun": "5hanayome",
  quints: "5hanayome",
  // Konosuba
  konosuba: "konosuba",
  // A Certain Magical Index
  // A Certain Scientific Railgun
  index: "toarumajutsunoindex",
  railgun: "toarumajutsunoindex",
  cientificrailgun: "toarumajutsunoindex",
  magicalindex: "toarumajutsunoindex",
  // Steins;Gate
  "steins-gate": "steins-gate",
  steinsgate: "steins-gate",
  sg: "steins-gate",
  // Fate series (Type Moon)
  fateseries: "typemoon",
  fate: "typemoon",
  // Fate Grand Order
  fgo: "fategrandorder",
  arknights: "mrfz",
};

// discord
const no_mentions: AllowedMentions = {
  parse: [],
  roles: [],
  users: [],
  replied_user: false,
};

export { colors, no_mentions };

export const DISCORD_TOKEN_TTL = 15 * 60 * 1000; // 15 mins
