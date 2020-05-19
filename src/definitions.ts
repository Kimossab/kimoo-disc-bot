
export enum GATEWAY_OPCODES {
  DISPATCH = 0,
  HEARTBEAT = 1,
  IDENTIFY = 2,
  STATUS_UPDATE = 3,
  VOICE_STATE_UPDATE = 4,
  VOICE_SERVER_PING = 5,
  RESUME = 6,
  RECONNECT = 7,
  REQUEST_GUILD_MEMBERS = 8,
  INVALID_SESSION = 9,
  HELLO = 10,
  HEARTBEAT_ACK = 11
};

//https://saucenao.com/status.html
// bitmask is currently broken on their side so use db=999 for now
export enum SAUCENOW_INDEXES {
  HMagazines = 0, //incomplete
  HGame_CG = 2, //incomplete
  DoujinshiDB = 3, //incomplete
  pixiv = 5,
  Nico_Nico = 8,
  Danbooru = 9,
  drawr = 10,
  Nijie = 11,
  Yandere = 12,
  Shutterstock = 15,
  FAKKU = 16,
  HMisc = 18,
  TwoDMarket = 19,
  MediBang = 20,
  Anime = 21, // ???
  HAnime = 22,
  Movies = 23,
  Shows = 24,
  Gelbooru = 25,
  Konachan = 26,
  Sankaku_Channel = 27,
  AnimePicturesNet = 28,
  e621 = 29,
  Idol_Complex = 30,
  bcy_illust = 31,
  bcy_cosplay = 32,
  PortalGraphics = 33,
  DeviantArt = 34,
  PawooNet = 35,
  Madokami = 36,
  MangaDex = 37,
}

export const FANDOM_LINKS: fandom.url_map = {
  // Sword Art Online
  "sao": "swordartonline",
  // Accel World
  "aw": "accelworld",
  // The Irregular At Magic High School
  "magichighschool": "mahouka-koukou-no-rettousei",
  "magichs": "mahouka-koukou-no-rettousei",
  "mahouka": "mahouka-koukou-no-rettousei",
  "irregular": "mahouka-koukou-no-rettousei",
  // Re:Zero
  "rezero": "rezero",
  // Overlord
  "overlord": "overlordmaruyama",
  // Quintessential Quintuplets
  "quintuplets": "5hanayome",
  "5toubun": "5hanayome",
  "quints": "5hanayome",
  // Konosuba
  "konosuba": "konosuba",
  // A Certain Magical Index
  // A Certain Scientific Railgun
  "index": "toarumajutsunoindex",
  "railgun": "toarumajutsunoindex",
  "cientificrailgun": "toarumajutsunoindex",
  "magicalindex": "toarumajutsunoindex",
  //Steins;Gate
  "steins-gate": "steins-gate",
  "steinsgate": "steins-gate",
  "sg": "steins-gate",
  // Fate series (Type Moon)
  "fateseries": "typemoon",
  "fate": "typemoon",
  // Fate Grand Order
  "fgo": "fategrandorder"
}