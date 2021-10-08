export const getNextAiringGraphql = `
query ($id: Int) {
  Media(id: $id, type: ANIME, status_in: [NOT_YET_RELEASED, RELEASING]) {
    nextAiringEpisode {
      id
      airingAt
      timeUntilAiring
      episode
    }
    airingSchedule {
      nodes {
        id,
        airingAt,
        timeUntilAiring,
        episode,
      }
    }
  }
}
`;
