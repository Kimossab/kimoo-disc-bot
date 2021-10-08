export const getNextAiringGraphql = `
query ($id: Int) {
  Media(id: $id) {
    nextAiringEpisode {
      id
      airingAt
      timeUntilAiring
      episode
    }
  }
}
`;
