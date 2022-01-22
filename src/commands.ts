import { MediaType } from "./anilist/types/graphql";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CreateGlobalApplicationCommand,
} from "./types/discord";

export const version = "1.4.5";

export const list: CreateGlobalApplicationCommand[] = [
  {
    name: "anilist",
    description: "Commands related to anilist",
    options: [
      {
        name: "search",
        description: "Search for an anime or manga",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "query",
            description: "Query to search for",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "type",
            description: "Query to search for",
            type: ApplicationCommandOptionType.STRING,
            choices: [
              {
                name: MediaType.ANIME,
                value: MediaType.ANIME,
              },
              {
                name: MediaType.MANGA,
                value: MediaType.MANGA,
              },
            ],
            required: false,
          },
        ],
      },
      {
        name: "sub",
        description: "Subscriptions commands",
        type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
        options: [
          {
            name: "add",
            description: "Add a subscription",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "anime",
                description: "Anime name",
                type: ApplicationCommandOptionType.STRING,
                required: true,
              },
            ],
          },
          {
            name: "list",
            description: "List your subscriptions",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [],
          },
        ],
      },
      {
        name: "schedule",
        description: "Search for an anime airing schedule",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "query",
            description: "Query to search for",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
      {
        name: "channel",
        description:
          "Sets the channel where the anime notification messages are sent to",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "channel",
            description:
              "The channel where the anime notification messages are sent to",
            type: ApplicationCommandOptionType.CHANNEL,
            required: false,
          },
        ],
      },
    ],
    type: ApplicationCommandType.CHAT_INPUT,
  },
  {
    name: "birthday",
    description: "Handles the birthdays of the users",
    options: [
      {
        name: "channel",
        description:
          "Sets the channel where the happy birthday message is sent to",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "channel",
            description:
              "The channel where the happy birthday message is sent to",
            type: ApplicationCommandOptionType.CHANNEL,
            required: false,
          },
        ],
      },
      {
        name: "add",
        description: "Adds your birthday to the database",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "day",
            description: "The day when you were born",
            type: ApplicationCommandOptionType.INTEGER,
            required: true,
          },
          {
            name: "month",
            description: "The month when you were born",
            type: ApplicationCommandOptionType.INTEGER,
            required: true,
          },
          {
            name: "year",
            description: "The year when they were born",
            type: ApplicationCommandOptionType.INTEGER,
          },
        ],
      },
      {
        name: "remove",
        description:
          "Removes someone's birthday from the database",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "user",
            description:
              "The user whose birthday you're removing",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
        ],
      },
      {
        name: "get",
        description:
          "Gets someone's birthday from the database",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "user",
            description:
              "The user whose birthday you're getting",
            type: ApplicationCommandOptionType.USER,
            required: false,
          },
          {
            name: "month",
            description:
              "The users whose birthday is on a certain month",
            type: ApplicationCommandOptionType.INTEGER,
            required: false,
          },
        ],
      },
      {
        name: "server",
        description: "Shows the server's birthday",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [],
      },
      {
        name: "role",
        description:
          "Sets the role to give to users on their birthday",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "role",
            description:
              "The role to give to users on their birthday",
            type: ApplicationCommandOptionType.ROLE,
            required: false,
          },
        ],
      },
    ],
  },
  {
    name: "wiki",
    description: "Search for an article from a fandom",
    options: [
      {
        name: "fandom",
        description: "Slug of the fandom to search",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
      {
        name: "query",
        description: "Search query",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
    ],
  },
  {
    name: "sauce",
    description: "Search for sauce for a image",
    options: [
      {
        name: "image",
        description: "Image url to search",
        type: ApplicationCommandOptionType.STRING,
      },
      {
        name: "type",
        description: "Type of image to search",
        type: ApplicationCommandOptionType.STRING,
        choices: [
          { name: "art", value: "art" },
          { name: "anime", value: "anime" },
        ],
      },
    ],
  },
  {
    name: "settings",
    description: "Bot settings for this server",
    options: [
      {
        name: "admin_role",
        description: "Gets or sets the admin role",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "role",
            description: "Role you want to set as admin",
            type: ApplicationCommandOptionType.ROLE,
            required: false,
          },
        ],
      },
    ],
  },
  {
    name: "achievements",
    description:
      "Handles everything related to achievements",
    options: [
      {
        name: "create",
        description:
          "Creates a new achievement (admin only)",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "name",
            description: "Achievement name",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "description",
            description: "Achievement description",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "points",
            description: "Achievement point value",
            type: ApplicationCommandOptionType.INTEGER,
            required: true,
          },
          {
            name: "image",
            description: "Achievement image URL",
            type: ApplicationCommandOptionType.STRING,
            required: false,
          },
        ],
      },
      {
        name: "update",
        description: "Updates an achievement (admin only)",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "id",
            description: "Achievement id",
            type: ApplicationCommandOptionType.INTEGER,
            required: true,
          },
          {
            name: "name",
            description: "Achievement name",
            type: ApplicationCommandOptionType.STRING,
          },
          {
            name: "description",
            description: "Achievement description",
            type: ApplicationCommandOptionType.STRING,
          },
          {
            name: "points",
            description: "Achievement point value",
            type: ApplicationCommandOptionType.INTEGER,
          },
          {
            name: "image",
            description: "Achievement image URL",
            type: ApplicationCommandOptionType.STRING,
          },
        ],
      },
      {
        name: "delete",
        description: "Deletes an achievement (admin only)",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "id",
            description: "Achievement id",
            type: ApplicationCommandOptionType.INTEGER,
            required: true,
          },
        ],
      },
      {
        name: "rank",
        description: "Server achievement ranks",
        type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
        options: [
          {
            name: "list",
            description: "Lists the server ranks",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [],
          },
          {
            name: "user",
            description: "Shows the rank of a user",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "user",
                description: "User to get the rank of",
                type: ApplicationCommandOptionType.USER,
                required: false,
              },
            ],
          },
          {
            name: "leaderboard",
            description: "Shows the server leaderboard",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [],
          },
          {
            name: "create",
            description: "Creates a new rank",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "name",
                description: "Rank name",
                type: ApplicationCommandOptionType.STRING,
                required: true,
              },
              {
                name: "points",
                description:
                  "Points necessary to achieve this rank",
                type: ApplicationCommandOptionType.INTEGER,
                required: true,
              },
            ],
          },
          {
            name: "delete",
            description: "Deletes a rank",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "name",
                description: "Rank name",
                type: ApplicationCommandOptionType.STRING,
                required: true,
              },
            ],
          },
        ],
      },
      {
        name: "list",
        description: "Lists achievements",
        type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
        options: [
          {
            name: "server",
            description: "Lists server achievements",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [],
          },
          {
            name: "user",
            description: "Lists user achievements",
            type: ApplicationCommandOptionType.SUB_COMMAND,
            options: [
              {
                name: "user",
                description: "User to lsit",
                type: ApplicationCommandOptionType.USER,
                required: false,
              },
            ],
          },
        ],
      },
      {
        name: "give",
        description:
          "Gives an achievement to a user (Admin only)",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "user",
            description: "User to give the achievement to",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
          {
            name: "achievement",
            description:
              "Achievement id to give to the user",
            type: ApplicationCommandOptionType.INTEGER,
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: "vn",
    description: "Gets Visual Novel information",
    options: [
      {
        name: "search",
        description: "Title to search for",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
    ],
  },
  {
    name: "misc",
    description: "Miscellaneous commands",
    options: [
      {
        name: "group",
        description: "Create random groups",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "groups",
            description: "Number of groups to create",
            type: ApplicationCommandOptionType.INTEGER,
            required: true,
          },
          {
            name: "values",
            description:
              "Names to group (seperate each name with ` | `)",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
        ],
      },
      {
        name: "donut",
        description: "Create a donut",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "a",
            description: "Angle of A (radians)",
            type: ApplicationCommandOptionType.STRING,
            required: false,
          },
          {
            name: "b",
            description: "Angle of B (radians)",
            type: ApplicationCommandOptionType.STRING,
            required: false,
          },
        ],
      },
    ],
  },
  {
    name: "badges",
    description: "Badges commands",
    options: [
      {
        name: "create",
        description: "Create a new badge",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "name",
            description: "Badge name",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "image",
            description: "Badge image",
            type: ApplicationCommandOptionType.STRING,
            required: false,
          },
        ],
      },
      {
        name: "list",
        description:
          "List badges from the user or the server",
        type: ApplicationCommandOptionType.SUB_COMMAND,
      },
      {
        name: "give",
        description: "Give a badge to a user",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "name",
            description: "Badge name",
            type: ApplicationCommandOptionType.STRING,
            required: true,
          },
          {
            name: "user",
            description: "User",
            type: ApplicationCommandOptionType.USER,
            required: true,
          },
        ],
      },
      {
        name: "user",
        description: "Get user badges",
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "user",
            description: "User",
            type: ApplicationCommandOptionType.USER,
            required: false,
          },
        ],
      },
    ],
  },
];
