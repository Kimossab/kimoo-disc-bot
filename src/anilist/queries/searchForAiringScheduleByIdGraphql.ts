export const searchForAiringScheduleByIdGraphql = `query ($id: Int) {
  Media(id: $id, type: ANIME) {
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
    airingSchedule(notYetAired: true) {
      edges {
        node {
          id
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
    siteUrl
  }
}
`;
