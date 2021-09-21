export default {
  common: {
    page: 'Page <page>/<total>',
    no_permission: "You don't have permission to use this command",
    internal_error: 'Something went wrong',
    no_image: 'No image was found',
  },
  birthday: {
    user: "<user>'s birthday: <date>",
    server: "Server's birthday: <date>",
    server_bday:
      'Hoje, faz <age> anos que este server foi criado. MUITOS PARABÉNS <name>!',
    today_bday: 'Deem todos os parabéns ao aniversariante de hoje:',
    today_bday_s: 'Deem todos os parabéns aos aniversariantes de hoje:',
    already_set: 'User already has a birthday set',
    not_found: 'User birthday not found',
    found_zero: 'No birthdays found for the month <month>',
    set_success: 'Birthday to user <user> set successfully for date <date>',
    remove_success: 'User birthday removed',
    channel_set_success: 'Birthday channel set successfully to <channel>',
    servers_channel: "Server's birthday channel: <channel>",
  },
  fandom: {
    invalid_slug: 'Invalid fandom slug',
  },
  livechart: {
    list: '<user> subscription list',
    list_not_found: 'No subscriptions found',
    new_episode: 'New episode',
    date: 'Date',
    sub_exists: 'Subscription for <link> already exists',
    sub_doesnt_exists: "Subscription for <link> doesn't exist",
    channel_set_success: 'Anime channel set successfully to <channel>',
    sub_success: 'Subscription for <link> addedd successfully',
    unsub_success: 'Subscription for <link> removed successfully',
    anime_not_found: 'Anime with ID <id> not found',
  },
  mal: {
    type: 'Type: <type>',
    score: 'Score',
    status: 'Status',
    favorites: 'Favorites',
    related_works: 'Related works',
    alternative_names: 'Alternative names',
    birthday: 'Birthday',
    not_found: 'No content found for that query',
  },
  misc: {
    group: 'Group <index>',
  },
  sauce: {
    not_found: 'No source found',
    similarity: 'Similarity',
    season: 'Season',
    other_names: 'Other names',
    image_not_found: 'No image found to request.',
  },
  achievements: {
    already_exists: 'Achievement already exists',
    create_success: 'Achievement <name> created successfully',
    update_success: 'Achievement <name> updated successfully',
    delete_success: 'Achievement <id> deleted successfully',
    not_found: 'Achievement with id <id> was not found',
    already_got: 'User <user> already got the achievement <id>',
    given_success: 'Achievement <name> given to <user> with success',
    rank_exists: 'Achievement rank <name> already exists',
    rank_point_exists:
      'Achievement wtih <points> points already exists: <name>',
    rank_create_success:
      'Achievement <name> with <points> points created successfully',
    new_achievement_awarded: 'New achievement awarded',
    new_achievement_awarded_desc:
      '<name> - <description>\nAwarded <points> points',
    progress: 'Achievement progress',
    user_achievements: 'User Achievements',
    server_no_achievements: 'Server has no achievements yet',
    user_no_achievements: 'User has no achievements yet',
    server_achievements: 'Server achievements',
    server_achievement_ranks: 'Server Achievement Ranks',
    server_leaderboard: 'Server Achievement Leaderboard',
    rank_deleted: 'Rank deleted',
  },
  badges: {
    not_found: 'No badge found with that name'
  }
};
