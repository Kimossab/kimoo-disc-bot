import * as Actions from "../src/state/actions";

const defaultUser = {
  bot: false,
  id: "",
  username: "",
  discriminator: "",
  avatar: "",
};

const defaultMember = {
  user: defaultUser,
  nick: "",
  roles: [],
  joined_at: "",
  deaf: false,
  mute: false,
};

const defaultGuild = {
  id: "",
  name: "",
  icon: "",
  splash: "",
  discovery_splash: "",
  owner_id: "",
  region: "",
  afk_channel_id: "",
  afk_timeout: 0,
  verification_level: 0,
  default_message_notifications: 0,
  explicit_content_filter: 0,
  roles: [],
  emojis: [],
  features: ["VERIFIED"],
  mfa_level: 0,
  application_id: "",
  system_channel_id: "",
  system_channel_flags: 0,
  vanity_url_code: "",
  description: "",
  banner: "",
  premium_tier: 0,
  preferred_locale: "PT",
  public_updates_channel_id: "",
  approximate_member_count: 0,
  approximate_presence_count: 0,
};

describe("Logger", () => {
  it("Ready callback", () => {
    const callback = () => {
      expect(true).toEqual(true);
    };

    Actions.setReadyCallback(callback);
    Actions.setReadyData({
      v: 8,
      user: defaultUser,
      private_channels: [],
      guilds: [],
      session_id: "123456789",
      application: {
        id: "123456789",
        name: "hello",
        description: "heelo",
        bot_public: false,
        bot_require_code_grant: false,
        owner: defaultUser,
        summary: "",
        verify_key: "",
        flags: 0,
        team: null,
        icon: null,
      },
    });
  });

  it("Command callback", () => {
    const callback = () => {
      expect(true).toEqual(true);
    };

    Actions.setCommandExecutedCallback(callback);
    Actions.commandExecuted({
      id: "",
      type: 2,
      guild_id: "",
      channel_id: "",
      member: defaultMember,
      token: "",
      version: 8,
    });
  });

  it("Guilds", () => {
    Actions.addGuild({
      ...defaultGuild,
      id: "123456789",
    });
    Actions.addGuild({
      ...defaultGuild,
      id: "987654321",
    });

    const guilds = Actions.getGuilds();

    expect(guilds.map((g) => g.id)).toEqual(["123456789", "987654321"]);
  });

  it("Application", () => {
    const app = Actions.getApplication();

    expect(app?.id).toEqual("123456789");
  });

  it("Reaction Callback", () => {
    const reaction = {
      user_id: "123456",
      channel_id: "12345",
      message_id: "1234",
      emoji: {
        name: "",
        id: "",
      },
    };

    const callback = (data: any, remove: boolean): void => {
      expect(data.user_id).toEqual("123456");
      expect(data.channel_id).toEqual("12345");
      expect(data.message_id).toEqual("1234");
      expect(remove).toEqual(false);
    };

    Actions.setReactionCallback(callback);
    Actions.gotNewReaction(reaction, false);
  });

  it("Attachments", () => {
    Actions.setChannelLastAttachment("123456", "attach_1");
    Actions.setChannelLastAttachment("654321", "attach_2");

    const a1 = Actions.getChannelLastAttchment("123456");
    const a2 = Actions.getChannelLastAttchment("654321");

    expect(a1).toEqual("attach_1");
    expect(a2).toEqual("attach_2");
  });
});
