/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from "@/helper/logger";

import {
  deleteAllSubscriptionsForId,
  getAllSubscriptionsForAnime,
  setNextAiring,
} from "../database";
import { getNextAiringEpisode, searchByScheduleId } from "../graphql/graphql";
import { IAnimeNotification } from "../models/animeNotification.model";
import { AnimeManager } from "./anime-manager";
import { IAnilistRateLimit } from "./rate-limiter";

jest.mock("@/discord/rest");

jest.mock("../graphql/graphql");
const mockSearchByScheduleId = searchByScheduleId as jest.Mock;
const mockGetNextAiringEpisode = getNextAiringEpisode as jest.Mock;

jest.mock("../database");
const mockGetAllSubscriptionsForAnime =
  getAllSubscriptionsForAnime as jest.Mock;
const mockDeleteAllSubscriptionsForId =
  deleteAllSubscriptionsForId as jest.Mock;
const mockSetNextAiring = setNextAiring as jest.Mock;

const mockRateLimiterRequest = jest.fn();
const mockRateLimiter: IAnilistRateLimit = {
  request: mockRateLimiterRequest,
};
const mockLogger: ILogger = {
  log: jest.fn(),
  error: jest.fn(),
};
const mockOnDelete = jest.fn();

describe("AnimeManager", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("When the anime next airing is null", () => {
    let spySetTimer: jest.SpyInstance;
    const animeNotification: IAnimeNotification = {
      id: 123456,
      nextAiring: null,
    };
    let manager: AnimeManager;

    beforeEach(() => {
      manager = new AnimeManager(
        mockLogger,
        mockRateLimiter,
        animeNotification,
        mockOnDelete
      );
      spySetTimer = jest.spyOn(manager as any, "setTimer");
      spySetTimer.mockImplementation(() => ({}));
    });
    afterEach(() => {
      spySetTimer.mockClear();
    });

    it("should attempt to get the next airing episode from anilist", async () => {
      const spySetNextEpisodeOrDelete = jest.spyOn(
        manager as any,
        "setNextEpisodeOrDelete"
      );
      await manager.checkNextEpisode();

      expect(spySetNextEpisodeOrDelete).toHaveBeenCalled();
      expect(mockGetNextAiringEpisode).toHaveBeenCalledWith(
        mockRateLimiter,
        123456
      );
    });

    describe("when anilist returns null", () => {
      beforeEach(async () => {
        mockGetNextAiringEpisode.mockResolvedValueOnce(null);
        await manager.checkNextEpisode();
      });

      it("should delete all database information", async () => {
        expect(mockDeleteAllSubscriptionsForId).toHaveBeenCalledWith(123456);
      });

      it("should call the onDelete callback", async () => {
        expect(mockOnDelete).toHaveBeenCalledWith(123456);
      });

      it("shouldn't make any other requests to the DB", async () => {
        expect(mockSetNextAiring).not.toHaveBeenCalled();
      });

      it("should not set the timer", async () => {
        expect(spySetTimer).not.toHaveBeenCalled();
      });
    });

    describe("when anilist returns with the next airing as null", () => {
      beforeEach(async () => {
        mockGetNextAiringEpisode.mockResolvedValueOnce({
          Media: {
            nextAiringEpisode: null,
            airingSchedule: { nodes: [] },
          },
        });
        await manager.checkNextEpisode();
      });

      it(`should set the next airing as null`, () => {
        expect(mockSetNextAiring).toHaveBeenCalledWith(123456, null);
      });

      it("shouldn't make any other requests to the DB", () => {
        expect(mockGetAllSubscriptionsForAnime).not.toHaveBeenCalled();
      });

      it("shouldn't call onDelete", () => {
        expect(mockOnDelete).not.toHaveBeenCalled();
      });

      it("should set the timer with undefined", () => {
        expect(spySetTimer).toHaveBeenCalledWith(undefined);
      });
    });

    describe("when anilist returns nextAiringEpisode with values", () => {
      beforeEach(async () => {
        mockGetNextAiringEpisode.mockResolvedValueOnce({
          Media: {
            nextAiringEpisode: {
              id: 78954646,
              timeUntilAiring: 606060,
            },
            airingSchedule: { nodes: [] },
          },
        });
        manager.checkNextEpisode();
      });

      it(`should set the next airing as 78954646`, () => {
        expect(mockSetNextAiring).toHaveBeenCalledWith(123456, 78954646);
      });

      it("shouldn't make any other requests to the DB", () => {
        expect(mockGetAllSubscriptionsForAnime).not.toHaveBeenCalled();
      });

      it("shouldn't call onDelete", () => {
        expect(mockOnDelete).not.toHaveBeenCalled();
      });

      it("should set the timer with 606060", () => {
        expect(spySetTimer).toHaveBeenCalledWith(606060);
      });
    });
  });

  describe("When the anime next airing exists", () => {
    let spySetTimer: jest.SpyInstance;
    let spySetNextEpisodeOrDelete: jest.SpyInstance;
    let spyNotifyNewEpisode: jest.SpyInstance;
    const animeNotification: IAnimeNotification = {
      id: 123456,
      nextAiring: 987654,
    };
    let manager: AnimeManager;

    beforeEach(() => {
      manager = new AnimeManager(
        mockLogger,
        mockRateLimiter,
        animeNotification,
        mockOnDelete
      );
      spySetTimer = jest.spyOn(manager as any, "setTimer");
      spySetTimer.mockImplementation(() => ({}));
      spySetNextEpisodeOrDelete = jest.spyOn(
        manager as any,
        "setNextEpisodeOrDelete"
      );
      spyNotifyNewEpisode = jest.spyOn(manager as any, "notifyNewEpisode");
      spyNotifyNewEpisode.mockImplementation(() => ({}));
    });
    afterEach(() => {
      spySetTimer.mockClear();
      spySetNextEpisodeOrDelete.mockClear();
      spyNotifyNewEpisode.mockClear();
    });

    it("should get the episode info from anilist", async () => {
      await manager.checkNextEpisode();
      expect(mockSearchByScheduleId).toHaveBeenCalledWith(
        mockRateLimiter,
        987654
      );
    });

    describe("when anilist doesn't return info about the next airing id", () => {
      beforeEach(async () => {
        mockSearchByScheduleId.mockResolvedValueOnce(null);
        await manager.checkNextEpisode();
      });

      it("should just get the next episode from anilist", () => {
        expect(spySetNextEpisodeOrDelete).toHaveBeenCalled();
      });
    });

    describe("when next airing time is in the future", () => {
      beforeEach(async () => {
        mockSearchByScheduleId.mockResolvedValueOnce({
          AiringSchedule: { timeUntilAiring: 600 },
        });
        await manager.checkNextEpisode();
      });

      it("should just get the next episode from anilist", () => {
        expect(spySetTimer).toHaveBeenCalledWith(600);
      });
    });

    describe("when next airing time is in the past", () => {
      it("should send the message if it aired less than MIN_TIME_TO_NOTIFY ago", async () => {
        mockSearchByScheduleId.mockResolvedValueOnce({
          AiringSchedule: { timeUntilAiring: -600 },
        });
        await manager.checkNextEpisode();
        expect(spyNotifyNewEpisode).toHaveBeenCalled();
        expect(spySetNextEpisodeOrDelete).toHaveBeenCalled();
      });

      it("should not send the message if it aired longer than MIN_TIME_TO_NOTIFY ago", async () => {
        mockSearchByScheduleId.mockResolvedValueOnce({
          AiringSchedule: { timeUntilAiring: -60000000 },
        });
        await manager.checkNextEpisode();
        expect(spyNotifyNewEpisode).not.toHaveBeenCalled();
        expect(spySetNextEpisodeOrDelete).toHaveBeenCalled();
      });
    });
  });
});
