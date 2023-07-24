export const getUpcoming = `
query ($season: MediaSeason) {
  Page(perPage: 50) {
    media(type: ANIME, status: NOT_YET_RELEASED, season: $season, sort: POPULARITY_DESC) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      format
      description(asHtml: false)
      startDate {
        year
        month
        day
      }
      episodes
      duration
      countryOfOrigin
      source
      trailer {
        id
        site
        thumbnail
      }
      updatedAt
      coverImage {
        extraLarge
        large
        medium
        color
      }
      genres
      tags {
        name
        isMediaSpoiler
      }
      studios {
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
      externalLinks {
        url
        site
      }
      siteUrl
    }
  }
}
`;
