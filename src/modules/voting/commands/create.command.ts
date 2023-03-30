import { CommandInfo } from "#base-module";
import { createVoting, getPoll } from "#voting/database";
import { mapPollToComponents } from "#voting/mappers/mapPollToComponents";
import { mapPollToEmbed } from "#voting/mappers/mapPollToEmbed";
import { mapPollToSettingsEmbed } from "#voting/mappers/mapPollToSettingsEmbed";
import { IPoll } from "#voting/models/Poll.model";

import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import Logger from "@/helper/logger";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ActionRow,
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  ButtonStyle,
  CommandHandler,
  Component,
  ComponentCommandHandler,
  ComponentType,
  EditWebhookMessage,
  Interaction,
  InteractionCallbackData,
  InteractionCallbackDataFlags,
  InteractionCallbackType,
  MessageComponentInteractionData,
  ModalSubmitInteractionData,
  TextInput,
  TextInputStyle,
} from "@/types/discord";

const MAX_OPTIONS_PER_POLL = 25;

interface CreateCommandOptions {
  question: string;
  option_1: string;
  option_2: string;
  option_3?: string;
  option_4?: string;
  multiple_choice?: boolean;
  free_new_answer?: boolean;
  days?: number;
}

const definition: ApplicationCommandOption = {
  name: "create",
  description: "Creates a new poll in this channel",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "question",
      description: "The question you wish to ask, or the topic of the voting",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "option_1",
      description: "Option for the poll #1",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "option_2",
      description: "Option for the poll #2",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: "option_3",
      description: "Option for the poll #3",
      type: ApplicationCommandOptionType.STRING,
    },
    {
      name: "option_4",
      description: "Option for the poll #4",
      type: ApplicationCommandOptionType.STRING,
    },
    {
      name: "multiple_choice",
      description:
        "Whether the users can select more than 1 answer. (Defaults to false)",
      type: ApplicationCommandOptionType.BOOLEAN,
    },
    {
      type: ApplicationCommandOptionType.NUMBER,
      name: "days",
      description: "How many days should the poll run for. (Default 1 day)",
    },
    {
      name: "free_new_answer",
      description: "Whether the users add a new answer. (Defaults to false)",
      type: ApplicationCommandOptionType.BOOLEAN,
    },
  ],
};

const createPollMessageData = (poll: IPoll): EditWebhookMessage => ({
  embeds: [mapPollToEmbed(poll)],
  components: [
    ...mapPollToComponents(poll),
    {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          custom_id: `voting.create.add`,
          emoji: {
            id: null,
            name: "➕",
          },
        },
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          custom_id: `voting.create.settings`,
          label: "",
          emoji: {
            id: null,
            name: "⚙",
          },
        },
      ],
    },
  ],
});

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app && app.id && data.member && data.member.user) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const {
        question,
        option_1,
        option_2,
        option_3,
        option_4,
        multiple_choice,
        free_new_answer,
        days,
      } = getOptions<CreateCommandOptions>(
        [
          "question",
          "option_1",
          "option_2",
          "option_3",
          "option_4",
          "multiple_choice",
          "free_new_answer",
          "days",
        ],
        option.options
      );

      const hash = `${+new Date()}`;

      const options = [option_1, option_2];

      if (option_3) {
        options.push(option_3);
      }
      if (option_4) {
        options.push(option_4);
      }

      const poll = await createVoting({
        question,
        creator: data.member.user.id,
        days: days || 1,
        hash,
        multipleChoice: multiple_choice ?? false,
        startAt: new Date(),
        usersCanAddAnswers: !!free_new_answer,
        options: options.map((o) => ({
          text: o,
          votes: [],
        })),
      });

      const message = await editOriginalInteractionResponse(
        app.id,
        data.token,
        createPollMessageData(poll)
      );

      poll.hash = message?.id || hash;

      logger.log("New poll created", poll);

      await poll.save();
    }
  };
};

type ComponentHandler<
  T extends ModalSubmitInteractionData | MessageComponentInteractionData,
  E = void
> = (poll: IPoll, data: Interaction<T>, extra: E) => Promise<boolean>;

const componentHandler = (logger: Logger): ComponentCommandHandler => {
  const hasExpired = (poll: IPoll): boolean => {
    const daysInSeconds = poll.days * 60 * 60 * 24 * 1000;
    const endingDate = +poll.startAt + daysInSeconds;

    return +new Date() > endingDate;
  };

  const addCommand: ComponentHandler<MessageComponentInteractionData> = async (
    poll,
    data
  ) => {
    if (hasExpired(poll)) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This poll has expired",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
    } else if (poll.options.length === MAX_OPTIONS_PER_POLL) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `A poll can't have more than ${MAX_OPTIONS_PER_POLL} answers`,
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
    } else {
      if (!poll.usersCanAddAnswers && poll.creator !== data.member?.user?.id) {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              "You are not the creator of the poll so you can't add new options.",
            flags: InteractionCallbackDataFlags.EPHEMERAL,
          },
        });
      }

      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.MODAL,
        data: {
          custom_id: `voting.create.modal`,
          title: "Add new option",
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  custom_id: `voting.create.new_opt`,
                  style: TextInputStyle.Short,
                  label: "Option text",
                  min_length: 1,
                },
              ],
            },
          ],
        },
      });
    }

    return false;
  };

  const modalCommand: ComponentHandler<ModalSubmitInteractionData> = async (
    poll,
    data
  ) => {
    if (hasExpired(poll)) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This poll has expired",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return false;
    }

    if (poll.options.length === MAX_OPTIONS_PER_POLL) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `A poll can't have more than ${MAX_OPTIONS_PER_POLL} answers`,
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return false;
    }

    const newOption =
      ((data.data!.components[0] as ActionRow).components[0] as TextInput)
        .value || "";

    poll.options.push({ text: newOption, votes: [] });

    return true;
  };

  const settingsCommand: ComponentHandler<
    MessageComponentInteractionData
  > = async (poll, data) => {
    const components: ActionRow[] = mapPollToComponents(poll, "setOpt");

    if (!hasExpired(poll) && poll.options.length < MAX_OPTIONS_PER_POLL) {
      components.push({
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            custom_id: `voting.create.add`,
            emoji: {
              id: null,
              name: "➕",
            },
          },
        ],
      });
    }
    await createInteractionResponse(data.id, data.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionCallbackDataFlags.EPHEMERAL,
        content: "",
        embeds: [mapPollToSettingsEmbed(poll)],
        components,
      },
    });
    return false;
  };

  const settingsOptionCommand: ComponentHandler<
    MessageComponentInteractionData,
    string[]
  > = async (poll, data, optionSelected) => {
    const opt = Number(optionSelected[1]);
    const isNumber = !isNaN(opt);

    const components: ActionRow[] = mapPollToComponents(poll, "setOpt");
    const extraComponents: Component[] = [];

    if (!hasExpired(poll) && poll.options.length < MAX_OPTIONS_PER_POLL) {
      extraComponents.push({
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: `voting.create.add`,
        emoji: {
          id: null,
          name: "➕",
        },
      });
    }

    const embed = mapPollToSettingsEmbed(poll, isNumber ? opt : undefined);
    if (isNumber) {
      extraComponents.push({
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: `voting.create.setOpt.all`,
        label: "Show All",
      });
    }

    if (extraComponents.length > 0) {
      components.push({
        type: ComponentType.ActionRow,
        components: extraComponents,
      });
    }

    await createInteractionResponse(data.id, data.token, {
      type: InteractionCallbackType.UPDATE_MESSAGE,
      data: {
        flags: InteractionCallbackDataFlags.EPHEMERAL,
        content: "",
        embeds: [embed],
        components,
      },
    });
    return false;
  };

  const choiceCommand: ComponentHandler<
    MessageComponentInteractionData,
    number
  > = async (poll, data, optionChosen): Promise<boolean> => {
    if (hasExpired(poll)) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This poll has expired",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return false;
    }

    const userId = data.member?.user?.id || "";

    const userVotes = poll.options.reduce(
      (acc, opt) => acc + (opt.votes.find((v) => v === userId)?.length || 0),
      0
    );

    const option = poll.options[optionChosen];

    if (!option.votes.includes(userId)) {
      if (!poll.multipleChoice && userVotes > 0) {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "This poll doesn't allow multiple answers",
            flags: InteractionCallbackDataFlags.EPHEMERAL,
          },
        });
        return false;
      }
      option.votes.push(userId);
    } else {
      option.votes = option.votes.filter((v) => v !== userId);
    }

    return true;
  };

  type cHandler = ComponentHandler<
    MessageComponentInteractionData | ModalSubmitInteractionData,
    unknown
  >;

  const componentHandlers: Record<string, cHandler> = {
    "add": addCommand as cHandler,
    "modal": modalCommand as cHandler,
    "settings": settingsCommand as cHandler,
    "setOpt": settingsOptionCommand as cHandler,
  };

  return async (data, subCmd) => {
    const poll = await getPoll(
      data.message?.message_reference?.message_id || data.message?.id || ""
    );

    logger.log("Component interaction", subCmd);

    if (!poll) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Internal Server Error, try again",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return;
    }

    let needsToUpdateResponse = false;

    if (Object.keys(componentHandlers).includes(subCmd[0])) {
      needsToUpdateResponse = await componentHandlers[subCmd[0]](
        poll,
        data,
        subCmd
      );
    } else {
      needsToUpdateResponse = await choiceCommand(
        poll,
        data as Interaction<MessageComponentInteractionData>,
        Number(subCmd[0])
      );
    }

    await poll.save();
    if (needsToUpdateResponse) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.UPDATE_MESSAGE,
        data: createPollMessageData(poll) as InteractionCallbackData,
      });
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  componentHandler: componentHandler(logger),
});
