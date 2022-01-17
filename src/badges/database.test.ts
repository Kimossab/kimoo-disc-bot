import MongoMemoryServer from "mongodb-memory-server-core";
import {
  checkBadgeUser,
  checkName,
  createBadge,
  deleteBadge,
  getAllBadges,
  getAllUserBadges,
  getByName,
  giveBadge,
} from "./database";
import { badgeListFixture } from "./fixtures";
import { TestDB } from "../helper/tests";
import { IBadge } from "./models/badges.model";

let mongod: MongoMemoryServer;
describe("Badges database", () => {
  beforeAll(async () => {
    mongod = await TestDB.connect();
  });

  beforeEach(async () => {
    for (const fix of badgeListFixture) {
      await createBadge(
        fix.name,
        fix.server,
        fix.fileExtension
      );
    }
  });

  afterEach(async () => {
    await TestDB.clearDatabase();
  });

  afterAll(async () => {
    await TestDB.clearDatabase();
    await TestDB.closeDatabase(mongod);
  });

  it("should get a badge by name", async () => {
    const badge = await getByName(
      badgeListFixture[0].name,
      badgeListFixture[0].server
    );

    expect(badge).not.toBeNull();
    expect(badge?.name).toEqual(badgeListFixture[0].name);
    expect(badge?.fileExtension).toEqual(
      badgeListFixture[0].fileExtension
    );
  });

  it("should return true for a name that exists and false otherwise", async () => {
    await expect(
      checkName(
        badgeListFixture[0].name,
        badgeListFixture[0].server
      )
    ).resolves.toBe(true);

    await expect(
      checkName("fake name", badgeListFixture[0].server)
    ).resolves.toBe(false);
  });

  it("should return the list of badges of a server", async () => {
    await expect(
      getAllBadges(badgeListFixture[0].server)
    ).resolves.toEqual(
      badgeListFixture
        .filter(
          (b) => b.server === badgeListFixture[0].server
        )
        .map((b) => expect.objectContaining(b))
    );
  });

  it("should return the user's badges", async () => {
    const badge1 = await getByName(
      badgeListFixture[0].name,
      badgeListFixture[0].server
    );
    const badge2 = await getByName(
      badgeListFixture[1].name,
      badgeListFixture[1].server
    );

    if (badge1 && badge2) {
      await giveBadge(badge1, "USER_ID", badge1.server);
      await giveBadge(badge2, "USER_ID", badge1.server);
    }

    await expect(
      getAllUserBadges(
        "USER_ID",
        badgeListFixture[0].server
      )
    ).resolves.toEqual([
      {
        _id: "USER_ID",
        badges: [
          expect.objectContaining(badgeListFixture[0]),
          expect.objectContaining(badgeListFixture[1]),
        ],
      },
    ]);
  });

  it("should return true if the user has the badge and false otherwise", async () => {
    const badge = (await getByName(
      badgeListFixture[2].name,
      badgeListFixture[2].server
    )) as IBadge;

    await giveBadge(badge, "USER_ID", badge.server);

    await expect(
      checkBadgeUser(
        badge,
        "USER_ID",
        badgeListFixture[2].server
      )
    ).resolves.toBe(true);
    await expect(
      checkBadgeUser(
        badge,
        "USER_ID2",
        badgeListFixture[2].server
      )
    ).resolves.toBe(false);
  });

  it("should delete a badge", async () => {
    await deleteBadge(
      badgeListFixture[2].name,
      badgeListFixture[2].server
    );

    await expect(
      getAllBadges(badgeListFixture[2].server)
    ).resolves.toEqual(
      expect.arrayContaining(
        badgeListFixture
          .filter(
            (b) =>
              b.server === badgeListFixture[2].server &&
              b.name !== badgeListFixture[2].name
          )
          .map((b) => expect.objectContaining(b))
      )
    );
  });
});
