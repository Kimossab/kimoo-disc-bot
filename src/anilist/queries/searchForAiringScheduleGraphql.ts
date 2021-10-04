export const searchForAiringScheduleGraphql = `query ($search: String) {
  Media(search: $search, type: ANIME, status_in: [NOT_YET_RELEASED, RELEASING]) {
    id
    title {
      romaji
      english
      native
      userPreferred
    }
    coverImage {
      extraLarge
      large
      medium
      color
    }
    isAdult
    nextAiringEpisode {
      id
      airingAt
      timeUntilAiring
      episode
    }
    siteUrl
  }
}
`;
