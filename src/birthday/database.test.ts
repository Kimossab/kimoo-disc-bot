import { MongoMemoryServer } from "mongodb-memory-server";
import { getServerBirthdayChannel } from "../bot/database";
import serverSettingsModel from "../bot/server-settings.model";
import * as TestDB from "../helper/tests";
import {
  addBirthday,
  getBirthdays,
  getBirthdaysByMonth,
  getServersBirthdayChannel,
  getUserBirthday,
  updateLastWishes,
} from "./database";
import {
  birthdayFixtureDifferentMonth,
  birthdayFixtureOne,
  birthdayFixtureTwo,
  birthdayFixtureWithWishes,
} from "./fixtures";

let mongod: MongoMemoryServer;

describe("Birthday database", () => {
  beforeAll(async () => {
    mongod = await TestDB.connect();
  });

  beforeEach(async () => {
    await addBirthday(
      birthdayFixtureOne.server,
      birthdayFixtureOne.user,
      birthdayFixtureOne.day,
      birthdayFixtureOne.month,
      birthdayFixtureOne.year
    );
    await addBirthday(
      birthdayFixtureTwo.server,
      birthdayFixtureTwo.user,
      birthdayFixtureTwo.day,
      birthdayFixtureTwo.month,
      birthdayFixtureTwo.year
    );
    await addBirthday(
      birthdayFixtureWithWishes.server,
      birthdayFixtureWithWishes.user,
      birthdayFixtureWithWishes.day,
      birthdayFixtureWithWishes.month,
      birthdayFixtureWithWishes.year
    );
    await addBirthday(
      birthdayFixtureDifferentMonth.server,
      birthdayFixtureDifferentMonth.user,
      birthdayFixtureDifferentMonth.day,
      birthdayFixtureDifferentMonth.month,
      birthdayFixtureDifferentMonth.year
    );

    await serverSettingsModel.create({
      serverId: birthdayFixtureOne.server,
      birthdayChannel: "channel1",
    });
    await serverSettingsModel.create({
      serverId: birthdayFixtureTwo.server,
      birthdayChannel: "channel2",
    });
  });

  afterEach(async () => {
    await TestDB.clearDatabase();
  });

  afterAll(async () => {
    await TestDB.clearDatabase();
    await TestDB.closeDatabase(mongod);
  });

  it("should return the birthdays of people with lastWishes null or before a year", async () => {
    const birthdays = await getBirthdays(30, 11, 2021);

    expect(birthdays).toEqual([
      expect.objectContaining(birthdayFixtureOne),
      expect.objectContaining(birthdayFixtureTwo),
      expect.objectContaining(birthdayFixtureWithWishes),
    ]);
  });

  it("should return the birthday of a user", async () => {
    const birthday = await getUserBirthday(
      birthdayFixtureOne.server,
      birthdayFixtureOne.user
    );

    expect(birthday).toEqual(
      expect.objectContaining(birthdayFixtureOne)
    );
  });

  it("should return the birthdays of people in a month", async () => {
    const birthday = await getBirthdaysByMonth(
      birthdayFixtureOne.server,
      11
    );

    expect(birthday).toEqual([
      expect.objectContaining(birthdayFixtureOne),
    ]);
  });

  it("should update last wishes", async () => {
    await updateLastWishes(birthdayFixtureOne.server, [
      birthdayFixtureOne.user,
      birthdayFixtureDifferentMonth.user,
    ]);

    await expect(
      getUserBirthday(
        birthdayFixtureOne.server,
        birthdayFixtureOne.user
      )
    ).resolves.toEqual(
      expect.objectContaining({
        ...birthdayFixtureOne,
        lastWishes: 2021,
      })
    );
    await expect(
      getUserBirthday(
        birthdayFixtureOne.server,
        birthdayFixtureDifferentMonth.user
      )
    ).resolves.toEqual(
      expect.objectContaining({
        ...birthdayFixtureDifferentMonth,
        lastWishes: 2021,
      })
    );
  });

  it("should return the birthdays of the server", async () => {
    await expect(
      getServersBirthdayChannel()
    ).resolves.toEqual({
      [birthdayFixtureOne.server]: "channel1",
      [birthdayFixtureTwo.server]: "channel2",
    });
  });
});
