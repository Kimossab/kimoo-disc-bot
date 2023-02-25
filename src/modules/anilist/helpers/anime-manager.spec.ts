import { deleteAllSubscriptionsForId } from "#anilist/database";
import { getFullAiringSchedule } from "#anilist/graphql/graphql";
import { ILastAiredNotificationDocument } from "#anilist/models/LastAiredNotification.model";
import {
  InfoWithSchedule,
  MediaStatus,
  NextEpisode,
  Nodes,
} from "#anilist/types/graphql";

import { ILogger } from "@/helper/logger";

import { AnimeManager, getLastAndNextEpisode } from "./anime-manager";

jest.mock("#anilist/database");
jest.mock("#anilist/graphql/graphql");
jest.mock("@/discord/rest");
jest.mock("@/bot/database");

const onDeleteMock = jest.fn();

const loggerMock: ILogger = {
  log: jest.fn(),
  error: jest.fn(),
};

const rateLimiterMock = {
  request: jest.fn(),
};

const animeMock = {
  id: 123,
  lastAired: 1,
  lastUpdated: new Date(),
} as ILastAiredNotificationDocument;

const mockNextEpisode1: NextEpisode = {
  id: 1,
  airingAt: 1644862800, // Feb 15, 2022 12:00:00 AM UTC
  timeUntilAiring: -31536000, // -1 year in seconds
  episode: 1,
};

const mockNextEpisode2: NextEpisode = {
  id: 2,
  airingAt: Date.now() / 1000 - 1, // 1 second ago
  timeUntilAiring: 1,
  episode: 2,
};

const mockNextEpisode3: NextEpisode = {
  id: 3,
  airingAt: Date.now() / 1000 + 3600, // 1 hour from now
  timeUntilAiring: 3600,
  episode: 3,
};

const mockAiringSchedule: Nodes<NextEpisode> = {
  nodes: [mockNextEpisode1, mockNextEpisode2, mockNextEpisode3],
};

const mockInfoWithSchedule: InfoWithSchedule = {
  id: 1,
  status: MediaStatus.RELEASING,
  title: {
    romaji: "Mock Title",
    english: "Mock Title",
    native: "Mock Title",
    userPreferred: "Mock Title",
  },
  isAdult: false,
  coverImage: {
    extraLarge: "https://example.com/image.png",
    large: "https://example.com/image.png",
    medium: "https://example.com/image.png",
    color: null,
  },
  siteUrl: "https://example.com",
  airingSchedule: mockAiringSchedule,
};

(getFullAiringSchedule as jest.Mock).mockResolvedValue({
  Media: mockInfoWithSchedule,
});

describe("AnimeManager", () => {
  let animeManager: AnimeManager;

  beforeEach(() => {
    jest.clearAllMocks();

    animeManager = new AnimeManager(
      loggerMock,
      rateLimiterMock,
      animeMock,
      onDeleteMock
    );
  });

  describe("constructor", () => {
    it("should set the anime, logger, rateLimiter, and onDelete properties", () => {
      expect(animeManager["anime"]).toBe(animeMock);
      expect(animeManager["logger"]).toBe(loggerMock);
      expect(animeManager["rateLimiter"]).toBe(rateLimiterMock);
      expect(animeManager["onDelete"]).toBe(onDeleteMock);
    });
  });

  describe("getLastAndNextEpisode", () => {
    let mockGetLastAndNextEpisode: jest.SpyInstance;
    beforeEach(() => {
      mockGetLastAndNextEpisode = jest.spyOn(
        animeManager as any,
        "getLastAndNextEpisode"
      );
    });

    it("should return the correct values", () => {
      expect(mockGetLastAndNextEpisode.mock.results[0]).toEqual({
        last: mockNextEpisode2,
        next: mockNextEpisode3,
      });
    });
  });

  describe("checkNextEpisode", () => {
    it("should get full airing schedule for the anime", async () => {
      await animeManager.checkNextEpisode();

      expect(getFullAiringSchedule).toHaveBeenCalledWith(
        rateLimiterMock,
        animeMock.id
      );
    });

    it("should delete all subscriptions and call onDelete if anime information is not found", async () => {
      (getFullAiringSchedule as jest.Mock).mockResolvedValueOnce(null);

      await animeManager.checkNextEpisode();

      expect(deleteAllSubscriptionsForId).toHaveBeenCalledWith(animeMock.id);
      expect(onDeleteMock).toHaveBeenCalledWith(animeMock.id);
    });

    it("should notify new episode if a new episode is available and update the timer", async () => {
      await animeManager.checkNextEpisode();

      expect(animeManager["notifyNewEpisode"]).toHaveBeenCalledWith(
        mockInfoWithSchedule,
        mockNextEpisode2,
        mockNextEpisode3
      );
    });

    it("should set the timer", async () => {
      await animeManager.checkNextEpisode();

      expect(animeManager["setTimer"]).toHaveBeenCalledWith(
        mockNextEpisode3.timeUntilAiring
      );
    });

    it("should delete all subscriptions and call onDelete if anime status is not in (NOT_YET_RELEASED, RELEASING, HIATUS)", async () => {
      (getFullAiringSchedule as jest.Mock).mockResolvedValueOnce({
        Media: {
          ...mockInfoWithSchedule,
          status: MediaStatus.FINISHED,
        },
      });

      await animeManager.checkNextEpisode();

      expect(deleteAllSubscriptionsForId).toHaveBeenCalledWith(animeMock.id);
      expect(onDeleteMock).toHaveBeenCalledWith(animeMock.id);
    });
  });

  describe("getLastAndNextEpisode", () => {
    it("should return the last and next episode info from the given airing schedule", () => {
      expect(
        getLastAndNextEpisode(mockInfoWithSchedule.airingSchedule)
      ).toEqual({
        last: mockNextEpisode2,
        next: mockNextEpisode3,
      });
    });
    it("should return last as null", () => {
      expect(
        getLastAndNextEpisode({ nodes: [mockNextEpisode3] }).last
      ).toBeNull();
    });
    it("should return next as null", () => {
      expect(
        getLastAndNextEpisode({ nodes: [mockNextEpisode2] }).next
      ).toBeNull();
    });
  });
});
