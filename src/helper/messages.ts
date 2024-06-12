const messageList = {
  common: {
    page: "Page <page>/<total>",
    no_permission: "You don't have permission to use this command",
    internal_error: "Something went wrong",
    no_image: "No image was found"
  },
  birthday: {
    user: "<user>'s birthday: <date>",
    server: "Server's birthday: <date>",
    server_bday:
      "Hoje, faz <age> anos que este server foi criado. MUITOS PARABÉNS <name>!",
    today_bday: "Deem todos os parabéns ao aniversariante de hoje:",
    today_bday_s: "Deem todos os parabéns aos aniversariantes de hoje:",
    already_set: "User already has a birthday set",
    not_found: "User birthday not found",
    found_zero: "No birthdays found for the month <month>",
    set_success: "Birthday to user <user> set successfully for date <date>",
    remove_success: "User birthday removed",
    channel_set_success: "Birthday channel set successfully to <channel>",
    servers_channel: "Server's birthday channel: <channel>",
    server_role: "Server's birthday role: <role>",
    set_role: "Server's birthday role set successfully to <role>",
    role_not_found: "This server doesn't have a birthday role."
  },
  fandom: {
    invalid_slug: "Invalid fandom slug"
  },
  misc: {
    group: "Group <index>"
  },
  sauce: {
    not_found: "No source found",
    similarity: "Similarity",
    season: "Season",
    other_names: "Other names",
    image_not_found: "No image found to request."
  },
  achievements: {
    already_exists: "Achievement already exists",
    create_success: "Achievement <name> created successfully",
    update_success: "Achievement <name> updated successfully",
    delete_success: "Achievement <id> deleted successfully",
    not_found: "Achievement with id <id> was not found",
    already_got: "User <user> already got the achievement <id>",
    given_success: "Achievement <name> given to <user> with success",
    rank_exists: "Achievement rank <name> already exists",
    rank_point_exists:
      "Achievement wtih <points> points already exists: <name>",
    rank_create_success:
      "Achievement <name> with <points> points created successfully",
    new_achievement_awarded: "New achievement awarded",
    new_achievement_awarded_desc:
      "<name> - <description>\nAwarded <points> points",
    progress: "Achievement progress",
    user_achievements: "User Achievements",
    server_no_achievements: "Server has no achievements yet",
    server_no_ranks: "Server has no ranks yet",
    user_no_achievements: "User has no achievements yet",
    server_achievements: "Server achievements",
    server_achievement_ranks: "Server Achievement Ranks",
    serverLeaderboard: "Server Achievement Leaderboard",
    rank_deleted: "Rank deleted"
  },
  badges: {
    not_found: "No badge found with that name"
  },
  anilist: {
    not_found: "No data found for the given query",
    channel_set_success: "Anime channel set successfully to <channel>",
    server_channel: "Server's anime channel: <channel>"
  },
  roles: {
    channel: {
      description:
        "Sets the channel where the self assigned roles will show up.",
      option: "The channel where the self assigned roles will show up",
      set_success: "Roles channel set successfully to <channel>",
      get: "Server's role channel: <channel>"
    },
    refresh: {
      description: "Refreshes the buttons for self assigned roles.",
      success: "Updated roles buttons successfully."
    },
    add: {
      description: "Adds a new role for self assignment.",
      role: "Role to be self assigned.",
      category: "Category this role belongs to.",
      icon: "Emoji name to represent this role.",
      success: "Added role successfully.",
      given: "You were given the role <role> successfully.",
      removed: "You removed the role <role> successfully."
    },
    info: {
      category: "# <category>"
    },
    errors: {
      no_channel: "This server doesn't have a defined channel for roles.",
      too_many_roles:
        "The category <category> has too many roles, please use a different category.",
      duplicate: "The role is already in the category.",
      failure: "An unknown error occurred, try again or contact a moderator."
    }
  }
};
export default messageList;
