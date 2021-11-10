import { MediaType } from "./anilist/types/graphql";
import { application_command_option_type } from "./helper/constants";

export const version = "1.4.4";

export const list: discord.application_command[] = [
  {
    name: "anilist",
    description: "Commands related to anilist",
    options: [
      {
        name: "search",
        description: "Search for an anime or manga",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "query",
            description: "Query to search for",
            type: application_command_option_type.STRING,
            required: true,
          },
          {
            name: "type",
            description: "Query to search for",
            type: application_command_option_type.STRING,
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
        type: application_command_option_type.SUB_COMMAND_GROUP,
        options: [
          {
            name: "add",
            description: "Add a subscription",
            type: application_command_option_type.SUB_COMMAND,
            options: [
              {
                name: "anime",
                description: "Anime name",
                type: application_command_option_type.STRING,
                required: true,
              },
            ],
          },
          {
            name: "list",
            description: "List your subscriptions",
            type: application_command_option_type.SUB_COMMAND,
            options: [],
          },
        ],
      },
      {
        name: "schedule",
        description: "Search for an anime airing schedule",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "query",
            description: "Query to search for",
            type: application_command_option_type.STRING,
            required: true,
          },
        ],
      },
      {
        name: "channel",
        description:
          "Sets the channel where the anime notification messages are sent to",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "channel",
            description:
              "The channel where the anime notification messages are sent to",
            type: application_command_option_type.CHANNEL,
            required: false,
          },
        ],
      },
    ],
  },
  {
    name: "birthday",
    description: "Handles the birthdays of the users",
    options: [
      {
        name: "channel",
        description:
          "Sets the channel where the happy birthday message is sent to",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "channel",
            description:
              "The channel where the happy birthday message is sent to",
            type: application_command_option_type.CHANNEL,
            required: false,
          },
        ],
      },
      {
        name: "add",
        description: "Adds your birthday to the database",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "day",
            description: "The day when you were born",
            type: application_command_option_type.INTEGER,
            required: true,
          },
          {
            name: "month",
            description: "The month when you were born",
            type: application_command_option_type.INTEGER,
            required: true,
          },
          {
            name: "year",
            description: "The year when they were born",
            type: application_command_option_type.INTEGER,
          },
        ],
      },
      {
        name: "remove",
        description:
          "Removes someone's birthday from the database",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "user",
            description:
              "The user whose birthday you're removing",
            type: application_command_option_type.USER,
            required: true,
          },
        ],
      },
      {
        name: "get",
        description:
          "Gets someone's birthday from the database",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "user",
            description:
              "The user whose birthday you're getting",
            type: application_command_option_type.USER,
            required: false,
          },
          {
            name: "month",
            description:
              "The users whose birthday is on a certain month",
            type: application_command_option_type.INTEGER,
            required: false,
          },
        ],
      },
      {
        name: "server",
        description: "Shows the server's birthday",
        type: application_command_option_type.SUB_COMMAND,
        options: [],
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
        type: application_command_option_type.STRING,
        required: true,
      },
      {
        name: "query",
        description: "Search query",
        type: application_command_option_type.STRING,
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
        type: application_command_option_type.STRING,
      },
      {
        name: "type",
        description: "Type of image to search",
        type: application_command_option_type.STRING,
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
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "role",
            description: "Role you want to set as admin",
            type: application_command_option_type.ROLE,
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
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "name",
            description: "Achievement name",
            type: application_command_option_type.STRING,
            required: true,
          },
          {
            name: "description",
            description: "Achievement description",
            type: application_command_option_type.STRING,
            required: true,
          },
          {
            name: "points",
            description: "Achievement point value",
            type: application_command_option_type.INTEGER,
            required: true,
          },
          {
            name: "image",
            description: "Achievement image URL",
            type: application_command_option_type.STRING,
            required: false,
          },
        ],
      },
      {
        name: "update",
        description: "Updates an achievement (admin only)",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "id",
            description: "Achievement id",
            type: application_command_option_type.INTEGER,
            required: true,
          },
          {
            name: "name",
            description: "Achievement name",
            type: application_command_option_type.STRING,
          },
          {
            name: "description",
            description: "Achievement description",
            type: application_command_option_type.STRING,
          },
          {
            name: "points",
            description: "Achievement point value",
            type: application_command_option_type.INTEGER,
          },
          {
            name: "image",
            description: "Achievement image URL",
            type: application_command_option_type.STRING,
          },
        ],
      },
      {
        name: "delete",
        description: "Deletes an achievement (admin only)",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "id",
            description: "Achievement id",
            type: application_command_option_type.INTEGER,
            required: true,
          },
        ],
      },
      {
        name: "rank",
        description: "Server achievement ranks",
        type: application_command_option_type.SUB_COMMAND_GROUP,
        options: [
          {
            name: "list",
            description: "Lists the server ranks",
            type: application_command_option_type.SUB_COMMAND,
            options: [],
          },
          {
            name: "user",
            description: "Shows the rank of a user",
            type: application_command_option_type.SUB_COMMAND,
            options: [
              {
                name: "user",
                description: "User to get the rank of",
                type: application_command_option_type.USER,
                required: false,
              },
            ],
          },
          {
            name: "leaderboard",
            description: "Shows the server leaderboard",
            type: application_command_option_type.SUB_COMMAND,
            options: [],
          },
          {
            name: "create",
            description: "Creates a new rank",
            type: application_command_option_type.SUB_COMMAND,
            options: [
              {
                name: "name",
                description: "Rank name",
                type: application_command_option_type.STRING,
                required: true,
              },
              {
                name: "points",
                description:
                  "Points necessary to achieve this rank",
                type: application_command_option_type.INTEGER,
                required: true,
              },
            ],
          },
          {
            name: "delete",
            description: "Deletes a rank",
            type: application_command_option_type.SUB_COMMAND,
            options: [
              {
                name: "name",
                description: "Rank name",
                type: application_command_option_type.STRING,
                required: true,
              },
            ],
          },
        ],
      },
      {
        name: "list",
        description: "Lists achievements",
        type: application_command_option_type.SUB_COMMAND_GROUP,
        options: [
          {
            name: "server",
            description: "Lists server achievements",
            type: application_command_option_type.SUB_COMMAND,
            options: [],
          },
          {
            name: "user",
            description: "Lists user achievements",
            type: application_command_option_type.SUB_COMMAND,
            options: [
              {
                name: "user",
                description: "User to lsit",
                type: application_command_option_type.USER,
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
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "user",
            description: "User to give the achievement to",
            type: application_command_option_type.USER,
            required: true,
          },
          {
            name: "achievement",
            description:
              "Achievement id to give to the user",
            type: application_command_option_type.INTEGER,
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
        type: application_command_option_type.STRING,
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
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "groups",
            description: "Number of groups to create",
            type: application_command_option_type.INTEGER,
            required: true,
          },
          {
            name: "values",
            description:
              "Names to group (seperate each name with ` | `)",
            type: application_command_option_type.STRING,
            required: true,
          },
        ],
      },
      {
        name: "donut",
        description: "Create a donut",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "a",
            description: "Angle of A (radians)",
            type: application_command_option_type.STRING,
            required: false,
          },
          {
            name: "b",
            description: "Angle of B (radians)",
            type: application_command_option_type.STRING,
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
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "name",
            description: "Badge name",
            type: application_command_option_type.STRING,
            required: true,
          },
          {
            name: "image",
            description: "Badge image",
            type: application_command_option_type.STRING,
            required: false,
          },
        ],
      },
      {
        name: "list",
        description:
          "List badges from the user or the server",
        type: application_command_option_type.SUB_COMMAND,
      },
      {
        name: "give",
        description: "Give a badge to a user",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "name",
            description: "Badge name",
            type: application_command_option_type.STRING,
            required: true,
          },
          {
            name: "user",
            description: "User",
            type: application_command_option_type.USER,
            required: true,
          },
        ],
      },
      {
        name: "user",
        description: "Get user badges",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "user",
            description: "User",
            type: application_command_option_type.USER,
            required: false,
          },
        ],
      },
    ],
  },
];
