
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