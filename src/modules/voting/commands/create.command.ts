import { CommandInfo } from "#base-module";
import { createVoting, getPoll } from "#voting/database";
import { mapPollToComponents } from "#voting/mappers/mapPollToComponents";
import { mapPollToEmbed } from "#voting/mappers/mapPollToEmbed";
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

interface CreateCommandOptions {
  question: string;
  option_1: string;
  option_2: string;
  option_3?: string;
  option_4?: string;
  multiple_choice?: boolean;
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
          label: "New Answer",
        },
      ],
    },
  ],
});

const handler = (_logger: Logger): CommandHandler => {
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
        days,
      } = getOptions<CreateCommandOptions>(
        [
          "question",
          "option_1",
          "option_2",
          "option_3",
          "option_4",
          "multiple_choice",
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
      await poll.save();
    }
  };
};
const componentHandler = (_logger: Logger): ComponentCommandHandler => {
  const addCommand = async (
    poll: IPoll,
    data: Interaction<MessageComponentInteractionData>
  ) => {
    if (poll.creator !== data.member?.user?.id) {
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
  };

  const modalCommand = (poll: IPoll, modalData: ModalSubmitInteractionData) => {
    const newOption =
      ((modalData.components[0] as ActionRow).components[0] as TextInput)
        .value || "";

    poll.options.push({ text: newOption, votes: [] });
  };

  const choiceCommand = async (
    optionChosen: number,
    poll: IPoll,
    data: Interaction<MessageComponentInteractionData>
  ): Promise<boolean> => {
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

  return async (data, subCmd) => {
    const poll = await getPoll(data.message?.id || "");
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

    const endingDate = poll.startAt.setDate(poll.startAt.getDate() + 1);

    if (+new Date() > endingDate) {
      await createInteractionResponse(data.id, data.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This poll has expired",
          flags: InteractionCallbackDataFlags.EPHEMERAL,
        },
      });

      return;
    }

    if (subCmd.length === 1 && subCmd[0] === "add") {
      await addCommand(
        poll,
        data as Interaction<MessageComponentInteractionData>
      );
      return;
    }

    let success = true;
    if (subCmd.length === 1 && subCmd[0] === "modal") {
      modalCommand(poll, data.data as ModalSubmitInteractionData);
    } else {
      success = await choiceCommand(
        Number(subCmd[0]),
        poll,
        data as Interaction<MessageComponentInteractionData>
      );
    }

    await poll.save();
    if (success) {
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
