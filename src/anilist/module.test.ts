import { AnimeManager } from "./helpers/anime-manager";
import { getAllAnimeNotifications } from "./database";
import AnilistModule from "./module";

jest.mock("./database");
jest.mock("./graphql/graphql");
jest.mock("./helpers/anime-manager");
jest.mock("./helpers/rate-limiter");
jest.mock("../helper/logger");

(AnimeManager as jest.Mock).mockImplementation(
  (...props) => ({
    props,
    id: props[2].id,
    checkNextEpisode: jest.fn(),
  })
);

(getAllAnimeNotifications as jest.Mock).mockResolvedValue([
  {
    id: 123456,
    nextAiring: 987654,
  },
]);
describe("Anilist Module", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when module is deactivated", () => {
    beforeEach(async () => {
      await new AnilistModule(false).setUp();
    });

    it("should not get data from the database", () => {
      expect(
        getAllAnimeNotifications
      ).not.toHaveBeenCalled();
    });
  });

  describe("when module is active", () => {
    let module: AnilistModule;

    beforeEach(async () => {
      module = new AnilistModule(true);
      await module.setUp();
    });

    describe(".setUp", () => {
      it("should get all the anime notifications", () => {
        expect(getAllAnimeNotifications).toHaveBeenCalled();
      });

      it("should create a new manager", () => {
        expect(AnimeManager).toHaveBeenCalled();
      });

      it("should have 1 entry in the animeList", () => {
        expect((module as any).animeList.length).toEqual(1);
      });
    });
  });
});
