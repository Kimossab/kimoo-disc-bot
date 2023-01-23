import { AllowedMentions } from "../types/discord";

// common
export const PRESENCE_STRINGS = [
  "Doing witchy things",
  "It's not that I know everything, I just know what I know",
  "El Psy Kongroo",
  "Tuturu",
  "I'm working, I suppose",
  "Shitsurei, kamimashita",
  "01001000 01100101 01101100 01101100 01101111 00100000 01110111 01101111 01110010 01101100 01100100",
  "Who's that cute witch flying in this summer sky? That's right, it's me, Elaina",
  "EMT",
  "Who's Rem?",
  "As you like my pleasure",
  "Sono me, dare no me?",
  "Whose eyes are those?",
  "NullPo... Gah!",
  "Let us carry out the Singularity Project",
  "As you like, my pleasure",
  "I am *ATOMIC*",
  "My favorite type of magic - Lesbomancy",
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
