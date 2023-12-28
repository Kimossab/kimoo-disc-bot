import { CommandInfo } from "#base-module";
import {
  CompletePoll,
  createOption,
  createOptionVote,
  createVoting,
  deleteAllVotes,
  deleteOptionVote,
  getPoll,
  updateHash,
} from "#voting/database";
import { hasExpired } from "#voting/helpers";
import {
  mapPollToComponents,
  PollMessageType,
} from "#voting/mappers/mapPollToComponents";
import { mapPollToEmbed } from "#voting/mappers/mapPollToEmbed";
import { mapPollToSettingsEmbed } from "#voting/mappers/mapPollToSettingsEmbed";

import {
  createInteractionResponse,
  editMessage,
  editOriginalInteractionResponse,
} from "@/discord/rest";
import Logger from "@/helper/logger";
import { getOptions } from "@/helper/modules";
import { getApplication } from "@/state/store";
import {
  ActionRow,
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CommandHandler,
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

const createPollMessageData: {
  (poll: CompletePoll): EditWebhookMessage;
  (poll: CompletePoll, user: string): EditWebhookMessage;
} = (poll: CompletePoll, user?: string): EditWebhookMessage => {
  const embeds = [
    user ? mapPollToSettingsEmbed(poll, user) : mapPollToEmbed(poll),
  ];
  const components = user
    ? mapPollToComponents(poll, PollMessageType.SETTINGS, user)
    : mapPollToComponents(poll, PollMessageType.VOTE);

  const response: EditWebhookMessage = {
    embeds,
  };

  if (components.length) {
    response.components = components;
  }
  return response;
};

const handler = (logger: Logger): CommandHandler => {
  return async (data, option) => {
    const app = getApplication();
    if (app?.id && data.member?.user) {
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

      const poll = await createVoting(
        {
          question,
          creator: data.member.user.id,
          days: days ?? 1,
          hash,
          multipleChoice: multiple_choice ?? false,
          startAt: new Date(),
          usersCanAddAnswers: !!free_new_answer,
        },
        options.map((o) => ({
          text: o,
        }))
      );

      const message = await editOriginalInteractionResponse(
        app.id,
        data.token,
        createPollMessageData(poll)
      );

      await updateHash(poll.id, message?.id ?? hash);

      logger.info("New poll created", poll);
    }
  };
};

type ComponentHandler<
  T extends ModalSubmitInteractionData | MessageComponentInteractionData,
  E = void,
> = (
  poll: CompletePoll,
  data: Interaction<T>,
  extra: E
) => Promise<{ hasSentResponse: boolean; needsToUpdatePoll: boolean }>;

const componentHandler = (logger: Logger): ComponentCommandHandler => {
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
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    if (poll.pollOptions.length === MAX_OPTIONS_PER_POLL) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `A poll can't have more than ${MAX_OPTIONS_PER_POLL} answers`,
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }
    if (!poll.usersCanAddAnswers && poll.creator !== data.member?.user?.id) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:
            "You are not the creator of the poll so you can't add new options.",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });

      return { hasSentResponse: true, needsToUpdatePoll: false };
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

    return { hasSentResponse: true, needsToUpdatePoll: false };
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
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    if (poll.pollOptions.length === MAX_OPTIONS_PER_POLL) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `A poll can't have more than ${MAX_OPTIONS_PER_POLL} answers`,
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    const newOption =
      ((data.data!.components[0] as ActionRow).components[0] as TextInput)
        .value ?? "";

    await createOption(poll.id, newOption);

    return { hasSentResponse: false, needsToUpdatePoll: true };
  };

  const settingsCommand: ComponentHandler<
    MessageComponentInteractionData
  > = async (poll, data) => {
    const userId = data.member?.user?.id || "";

    await createInteractionResponse(data.id, data.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionCallbackDataFlags.EPHEMERAL,
        content: "",
        embeds: [mapPollToSettingsEmbed(poll, userId)],
        components: mapPollToComponents(poll, PollMessageType.SETTINGS, userId),
      },
    });

    return { hasSentResponse: true, needsToUpdatePoll: false };
  };

  const settingsOptionCommand: ComponentHandler<
    MessageComponentInteractionData,
    string[]
  > = async (poll, data, optionSelected) => {
    const opt = Number(optionSelected[1]);
    const isNumber = !isNaN(opt);
    const optSelected = isNumber ? opt : undefined;

    const userId = data.member?.user?.id || "";
    const components: ActionRow[] = mapPollToComponents(
      poll,
      PollMessageType.SETTINGS,
      userId,
      optSelected
    );
    const embed = mapPollToSettingsEmbed(poll, userId, optSelected);

    await createInteractionResponse(data.id, data.token, {
      type: InteractionCallbackType.UPDATE_MESSAGE,
      data: {
        flags: InteractionCallbackDataFlags.EPHEMERAL,
        content: "",
        embeds: [embed],
        components,
      },
    });

    return { hasSentResponse: true, needsToUpdatePoll: false };
  };

  const removeCommand: ComponentHandler<
    MessageComponentInteractionData,
    string[]
  > = async (poll, data, optionSelected) => {
    if (hasExpired(poll)) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This poll has expired",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    const opt = Number(optionSelected[1]);
    const isNumber = !isNaN(opt);
    const optSelected = isNumber ? opt : 0;

    const userId = data.member?.user?.id || "";

    if (userId !== poll.creator) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
          content: "Only the creator of the poll can remove an option",
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    poll.pollOptions = [
      ...poll.pollOptions.slice(0, optSelected),
      ...poll.pollOptions.slice(optSelected + 1),
    ];

    return { hasSentResponse: false, needsToUpdatePoll: true };
  };

  const choiceCommand: ComponentHandler<
    MessageComponentInteractionData,
    number
  > = async (poll, data, optionChosen) => {
    if (hasExpired(poll)) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This poll has expired",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    const userId = data.member?.user?.id || "";

    const userVotes = poll.pollOptions.reduce(
      (acc, opt) =>
        acc +
        (opt.pollOptionVotes.filter((v) => v.user === userId)?.length || 0),
      0
    );

    const option = poll.pollOptions[optionChosen];
    if (!option.pollOptionVotes.map((v) => v.user).includes(userId)) {
      if (!poll.multipleChoice && userVotes > 0) {
        await createInteractionResponse(data.id, data.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "This poll doesn't allow multiple answers",
            flags: InteractionCallbackDataFlags.EPHEMERAL,
          },
        });

        return { hasSentResponse: true, needsToUpdatePoll: false };
      }
      await createOptionVote(option.id, userId);
    } else {
      await deleteOptionVote(option.id, userId);
    }

    return { hasSentResponse: false, needsToUpdatePoll: true };
  };

  const closeCommand: ComponentHandler<
    MessageComponentInteractionData
  > = async (poll, data) => {
    if (hasExpired(poll)) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This poll has expired",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    const userId = data.member?.user?.id || "";

    if (userId !== poll.creator) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
          content: "Only the creator of the poll can close the poll",
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    poll.days = 0;

    return { hasSentResponse: false, needsToUpdatePoll: true };
  };

  const resetCommand: ComponentHandler<
    MessageComponentInteractionData
  > = async (poll, data) => {
    if (hasExpired(poll)) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This poll has expired",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    const userId = data.member?.user?.id || "";

    if (userId !== poll.creator) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionCallbackDataFlags.EPHEMERAL,
          content: "Only the creator of the poll can reset the poll",
        },
      });
      return { hasSentResponse: true, needsToUpdatePoll: false };
    }

    await deleteAllVotes(poll.id);

    return { hasSentResponse: false, needsToUpdatePoll: true };
  };

  type cHandler = ComponentHandler<
    MessageComponentInteractionData | ModalSubmitInteractionData,
    unknown
  >;

  const componentHandlers: Record<string, cHandler> = {
    "add": addCommand as cHandler,
    "modal": modalCommand as cHandler,
    "settings": settingsCommand as cHandler,
    "remove": removeCommand as cHandler,
    "close": closeCommand as cHandler,
    "reset": resetCommand as cHandler,
    "setOpt": settingsOptionCommand as cHandler,
  };

  return async (data, subCmd) => {
    const messageId =
      data.message?.message_reference?.message_id || data.message?.id || "";
    const isOriginalMessage = !data.message?.message_reference;

    const poll = await getPoll(messageId);

    logger.info("Component interaction", subCmd);

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

    let messageHasBeenCreated = false;
    let needsToUpdatePoll = false;

    if (Object.keys(componentHandlers).includes(subCmd[0])) {
      ({
        hasSentResponse: messageHasBeenCreated,
        needsToUpdatePoll: needsToUpdatePoll,
      } = await componentHandlers[subCmd[0]](poll, data, subCmd));
    } else {
      ({
        hasSentResponse: messageHasBeenCreated,
        needsToUpdatePoll: needsToUpdatePoll,
      } = await choiceCommand(
        poll,
        data as Interaction<MessageComponentInteractionData>,
        Number(subCmd[0])
      ));
    }
    const updatedPoll = await getPoll(messageId);
    if (!updatedPoll) {
      return;
    }

    if (!messageHasBeenCreated) {
      const responseData = (
        isOriginalMessage
          ? createPollMessageData(updatedPoll)
          : createPollMessageData(updatedPoll, data.member?.user?.id || "")
      ) as InteractionCallbackData;

      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.UPDATE_MESSAGE,
        data: responseData,
      });
    }

    if (!isOriginalMessage && needsToUpdatePoll) {
      await editMessage(data.channel_id ?? "", messageId, {
        ...createPollMessageData(updatedPoll),
        attachments: undefined,
      });
    }
  };
};

export default (logger: Logger): CommandInfo => ({
  definition,
  handler: handler(logger),
  componentHandler: componentHandler(logger),
});
