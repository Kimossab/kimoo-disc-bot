import { isRegExp } from "util";
import * as Common from "../src/helper/common";

describe("common", () => {
  it("String replace", () => {
    const str = Common.stringReplacer("Wrong reply from `<endpoint>`", {
      endpoint: "test",
    });

    expect(str).toEqual("Wrong reply from `test`");
  });

  it("Checks reaction user", () => {
    const user1 = Common.isValidReactionUser(
      {
        user_id: "",
        channel_id: "",
        message_id: "",
        emoji: {
          id: "",
          name: "",
        },
        member: {
          nick: "",
          roles: [],
          joined_at: "",
          deaf: false,
          mute: false,
          user: {
            bot: false,
            id: "",
            username: "",
            discriminator: "",
            avatar: "",
          },
        },
      },
      false
    );
    const user2 = Common.isValidReactionUser(
      {
        user_id: "",
        channel_id: "",
        message_id: "",
        emoji: {
          id: "",
          name: "",
        },
        member: {
          nick: "",
          roles: [],
          joined_at: "",
          deaf: false,
          mute: false,
          user: {
            bot: false,
            id: "",
            username: "",
            discriminator: "",
            avatar: "",
          },
        },
      },
      true
    );
    const user3 = Common.isValidReactionUser(
      {
        user_id: "",
        channel_id: "",
        message_id: "",
        emoji: {
          id: "",
          name: "",
        },
        member: {
          nick: "",
          roles: [],
          joined_at: "",
          deaf: false,
          mute: false,
          user: {
            bot: true,
            id: "",
            username: "",
            discriminator: "",
            avatar: "",
          },
        },
      },
      false
    );

    expect(user1).toEqual(true);
    expect(user2).toEqual(true);
    expect(user3).toEqual(false);
  });

  it("Convert seconds into minute string", () => {
    const mins = Common.formatSecondsIntoMinutes(2183.8);
    const mins2 = Common.formatSecondsIntoMinutes(5.2);

    expect(mins).toEqual("36:23");
    expect(mins2).toEqual("00:05");
  });

  it("Convert seconds into minute string", () => {
    const mins = Common.formatSecondsIntoMinutes(2183.8);

    expect(mins).toEqual("36:23");
  });

  it("Check snowflake", () => {
    const date = Common.snowflakeToDate("-2515711662489600000");

    expect(date).toEqual(new Date(820278000000));
  });

  it("Check random gen", () => {
    const max = Math.floor(Math.random() * 25);

    for (let i = 0; i < 2000; i++) {
      const num = Common.randomNum(i, i + max);
      expect(num).toBeGreaterThanOrEqual(i);
      expect(num).toBeLessThan(i + max);
    }
  });
});
