import { APIAllowedMentions } from "discord-api-types/v10";

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
  "kuraiyo~ kowaiyo~",
  "I ask you. Are you my master?",
  "EXPLOSIOOOOOOONNNN",
  "People die if they are killed...",
  "WHAT IF I HAD DIED?",
];

// discord
export const no_mentions: APIAllowedMentions = {
  parse: [],
  roles: [],
  users: [],
  replied_user: false,
};

export const DISCORD_TOKEN_TTL = 15 * 60 * 1000; // 15 mins
