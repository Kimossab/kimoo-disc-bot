export const searchGraphql = `
query ($search: String) {
  Page(page: 1, perPage: 10) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(search: $search) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      type
      format
      status(version: 2)
      description(asHtml: false)
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      season
      episodes
      duration
      volumes
      isLicensed
      source(version: 3)
      updatedAt
      coverImage {
        extraLarge
        large
        medium
        color
      }
      genres
      averageScore
      tags {
        name
      }
      relations {
        edges {
          node {
            title {
              romaji
              english
              native
              userPreferred
            }
            format
            siteUrl
          }
          relationType
        }
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
      isAdult
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      airingSchedule(notYetAired: true) {
        edges {
          node {
            airingAt
            timeUntilAiring
            episode
          }
        }
      }
      externalLinks {
        url
        site
      }
      siteUrl
    }
  }
}
`;
