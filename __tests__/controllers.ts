import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import * as Birthday from "../src/controllers/birthday.controller";
import * as Bot from "../src/controllers/bot.controller";
import * as Livechart from "../src/controllers/livechart.controller";
import Database from "../src/helper/database";
import { expect, beforeAll, afterAll, it, describe } from "@jest/globals";

beforeAll(async () => {
  const databaseURL = process.env.TEST_DATABASE_URL
    ? process.env.TEST_DATABASE_URL + -"test"
    : "mongodb://localhost:27017/interview-calendar-test";

  Database(databaseURL);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  mongoose.connection.close();
});

describe("test birthday controller", () => {
  it("Set/Get birthdays", async () => {
    await Birthday.addBirthday("123456789", "1234567", 30, 11, 1995);
    await Birthday.addBirthday("123456789", "7654321", 25, 1, 2000);
    await Birthday.addBirthday("987654321", "7654321", 25, 1, 2000);
    await Birthday.addBirthday("123456789", "1234567", 25, 1, 2000);

    const birthdays25 = await Birthday.getBirthdays(25, 1, 2021);
    const birthdays30 = await Birthday.getBirthdays(30, 11, 2021);

    expect(birthdays25.length).toEqual(2);
    expect(birthdays25[0].day).toEqual(25);
    expect(birthdays25[1].day).toEqual(25);
    expect(birthdays25[0].month).toEqual(1);
    expect(birthdays25[1].month).toEqual(1);
    expect(birthdays25[0].year).toEqual(2000);
    expect(birthdays25[1].year).toEqual(2000);
    expect(birthdays25[0].user).toEqual("7654321");
    expect(birthdays25[1].user).toEqual("7654321");
    expect(birthdays25[0].server).toEqual("123456789");
    expect(birthdays25[1].server).toEqual("987654321");

    expect(birthdays30.length).toEqual(1);
    expect(birthdays30[0].day).toEqual(30);
    expect(birthdays30[0].month).toEqual(11);
    expect(birthdays30[0].year).toEqual(1995);
    expect(birthdays30[0].user).toEqual("1234567");
    expect(birthdays30[0].server).toEqual("123456789");
  });

  it("Update/Get last wishes", async () => {
    await Birthday.updateLastWishes("123456789", ["1234567"]);
  });

  it("Get user birthday", async () => {
    const bday = await Birthday.getUserBirthday("123456789", "1234567");

    expect(bday.day).toEqual(30);
    expect(bday.month).toEqual(11);
    expect(bday.year).toEqual(1995);
    expect(bday.lastWishes).toEqual(new Date().getFullYear());
  });
});

describe("test bot controller", () => {
  it("Save guilds", async () => {
    await Bot.saveGuild("123456789");
    await Bot.saveGuild("987654321");
    await Bot.saveGuild("987654321");
  });

  it("Set/Get server anime channel", async () => {
    await Bot.setServerAnimeChannel("123456789", "55555");
    await Bot.setServerAnimeChannel("987654321", "99999");

    const chan1 = await Bot.getServerAnimeChannel("123456789");
    const chan2 = await Bot.getServerAnimeChannel("987654321");

    expect(chan1).toEqual("55555");
    expect(chan2).toEqual("99999");
  });

  it("Set/Get and update command last version", async () => {
    await Bot.setCommandVersion("1.0.0");
    await Bot.setCommandVersion("2.0.0");

    const lastVersion = await Bot.getCommandVersion();
    expect(lastVersion).toEqual("2.0.0");
  });

  it("Set/Get server birthday channel", async () => {
    await Bot.setServerBirthdayChannel("123456789", "11111");
    await Bot.setServerBirthdayChannel("987654321", "22222");

    const chan1 = await Bot.getServerBirthdayChannel("123456789");
    const chan2 = await Bot.getServerBirthdayChannel("987654321");

    expect(chan1).toEqual("11111");
    expect(chan2).toEqual("22222");
  });

  it("Set/Get server last birthday wishes", async () => {
    await Bot.updateServerLastWishes("123456789");

    const year = await Bot.getLastServerBirthdayWishes("123456789");

    expect(year).toEqual(new Date().getFullYear());
  });

  it("Set/Get server admin role", async () => {
    await Bot.setAdminRole("123456789", "5566778899");

    const role1 = await Bot.getAdminRole("123456789");
    const role2 = await Bot.getAdminRole("987654321");

    expect(role1).toEqual("5566778899");
    expect(role2).toBeNull();
  });
});

describe("test livechart controller", () => {
  it("Update/Get last request", async () => {
    const zero = await Livechart.getLastRequest();
    expect(zero).toEqual(0);

    const lastRequest = +new Date();
    await Livechart.updateLastRequest(lastRequest);

    const lr = await Livechart.getLastRequest();
    expect(lr).toEqual(lastRequest);

    const lastRequest2 = +new Date();
    await Livechart.updateLastRequest(lastRequest2);

    const lr2 = await Livechart.getLastRequest();
    expect(lr2).toEqual(lastRequest2);
  });

  it("Set/Get subscriptions", async () => {
    await Livechart.setSubscription("123456789", "1234567", 1234);
    await Livechart.setSubscription("123456789", "1234567", 1235);
    await Livechart.setSubscription("987654321", "1234567", 1235);
    await Livechart.setSubscription("987654321", "7654321", 1235);
    await Livechart.setSubscription("987654321", "7654321", 1235);

    const subs1 = await Livechart.getSubscriptions(1234);
    const subs2 = await Livechart.getSubscriptions(1235);

    expect(subs1.length).toEqual(1);
    expect(subs1[0].id).toEqual(1234);
    expect(subs1[0].server).toEqual("123456789");
    expect(subs1[0].user).toEqual("1234567");
    expect(subs2.length).toEqual(3);
    expect(subs2[0].id).toEqual(1235);
    expect(subs2[0].server).toEqual("123456789");
    expect(subs2[0].user).toEqual("1234567");
    expect(subs2[1].id).toEqual(1235);
    expect(subs2[1].server).toEqual("987654321");
    expect(subs2[1].user).toEqual("1234567");
    expect(subs2[2].id).toEqual(1235);
    expect(subs2[2].server).toEqual("987654321");
    expect(subs2[2].user).toEqual("7654321");
  });

  it("Remove/Get User subscriptions", async () => {
    await Livechart.removeSubscription("987654321", "1234567", 1235);

    const subs1user1 = await Livechart.getUserSubscriptions(
      "123456789",
      "1234567"
    );
    const subs2user1 = await Livechart.getUserSubscriptions(
      "987654321",
      "1234567"
    );
    const subs1user2 = await Livechart.getUserSubscriptions(
      "123456789",
      "7654321"
    );
    const subs2user2 = await Livechart.getUserSubscriptions(
      "987654321",
      "7654321"
    );

    expect(subs1user1.length).toEqual(2);
    expect(subs1user1[0]).toEqual(1234);
    expect(subs1user1[1]).toEqual(1235);

    expect(subs2user1.length).toEqual(0);

    expect(subs1user2.length).toEqual(0);

    expect(subs2user2.length).toEqual(1);
    expect(subs2user2[0]).toEqual(1235);
  });
});
