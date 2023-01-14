export const searchByScheduleIdGraphql = `query ($id: Int) {
  AiringSchedule(id: $id) {
    id
    airingAt
    timeUntilAiring
    episode
    mediaId
    media {
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
}
`;
