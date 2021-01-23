import { application_command_option_type } from "./helper/constants";

export const version = "0.1.11";

export const list: discord.application_command[] = [
  {
    name: "anime",
    description: "Handles subscriptions to anime airing notifications",
    options: [
      {
        name: "set",
        description: "Admin configuration for channel",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "channel",
            description: "Channel where notifications will be sent",
            type: application_command_option_type.CHANNEL,
            required: true,
          },
        ],
      },
      {
        name: "sub",
        description: "Add, remove or list your subscriptions",
        type: application_command_option_type.SUB_COMMAND_GROUP,
        options: [
          {
            name: "add",
            description: "Add a new subscription.",
            type: application_command_option_type.SUB_COMMAND,
            options: [
              {
                name: "livechart_id",
                description:
                  "ID in livechart of the anime to which you want to subscribe",
                type: application_command_option_type.INTEGER,
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Removes a subscription.",
            type: application_command_option_type.SUB_COMMAND,
            options: [
              {
                name: "livechart_id",
                description:
                  "ID in livechart of the anime to which you want to subscribe",
                type: application_command_option_type.INTEGER,
                required: true,
              },
            ],
          },
          {
            name: "list",
            description: "Lists a subscription.",
            type: application_command_option_type.SUB_COMMAND,
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
            required: true,
          },
        ],
      },
      {
        name: "add",
        description: "Adds someone's birthday to the database",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "user",
            description: "The user whose birthday you're setting",
            type: application_command_option_type.USER,
            required: true,
          },
          {
            name: "day",
            description: "The day when they were born",
            type: application_command_option_type.INTEGER,
            required: true,
          },
          {
            name: "month",
            description: "The month when they were born",
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
        description: "Removes someone's birthday from the database",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "user",
            description: "The user whose birthday you're removing",
            type: application_command_option_type.USER,
            required: true,
          },
        ],
      },
      {
        name: "get",
        description: "Gets someone's birthday from the database",
        type: application_command_option_type.SUB_COMMAND,
        options: [
          {
            name: "user",
            description: "The user whose birthday you're getting",
            type: application_command_option_type.USER,
            required: true,
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
    name: "mal",
    description: "Search for an entry on MAL",
    options: [
      {
        name: "query",
        description: "Query to search for",
        type: application_command_option_type.STRING,
        required: true,
      },
      {
        name: "type",
        description: "What type to search",
        type: application_command_option_type.STRING,
        required: false,
        choices: [
          {
            name: "all",
            value: "all",
          },
          {
            name: "manga",
            value: "manga",
          },
          {
            name: "anime",
            value: "anime",
          },
          {
            name: "person",
            value: "person",
          },
          {
            name: "character",
            value: "character",
          },
        ],
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
            description: "Names to group (seperate each name with ` | `)",
            type: application_command_option_type.STRING,
            required: true,
          },
        ],
      },
    ],
  },
];
