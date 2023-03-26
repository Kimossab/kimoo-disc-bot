export const searchByIdsGraphql = `
query ($ids: [Int]) {
  Page(page: 1, perPage: 100) {
    media(id_in:$ids) {
      id
      title {
        romaji
        english
        native
        userPreferred
      }
      siteUrl
      nextAiringEpisode {
        id
        airingAt
        timeUntilAiring
        episode
      }
    }
  }
}`;
