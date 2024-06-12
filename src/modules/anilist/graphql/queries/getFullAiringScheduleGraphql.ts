export const getFullAiringScheduleGraphql = `
query ($id: Int) {
  Media(id: $id, type: ANIME, status_in: [NOT_YET_RELEASED, RELEASING, FINISHED, HIATUS, CANCELLED]) {
    id
    status,
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
    airingSchedule(notYetAired:false) {
      nodes {
        airingAt,
        timeUntilAiring,
        episode,
      }
    }
    siteUrl
  }
}
`;
