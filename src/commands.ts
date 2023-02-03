import {
  ApplicationCommand,
  ApplicationCommandOption,
  ApplicationCommandOptionChoice,
  CreateGlobalApplicationCommand,
} from "./types/discord";

const compareChoices = (
  localChoices: ApplicationCommandOptionChoice[] = [],
  onlineChoices: ApplicationCommandOptionChoice[] = []
): boolean => {
  if (!localChoices && !onlineChoices) {
    return true;
  }
  if (
    !localChoices ||
    !onlineChoices ||
    localChoices.length !== onlineChoices.length
  ) {
    return false;
  }

  for (const choice of localChoices) {
    const oChoice = onlineChoices.find((c) => c.name === choice.name);
    if (!oChoice) {
      return false;
    }

    if (oChoice.value !== choice.value) {
      return false;
    }
  }

  return true;
};

const compareOptions = (
  localOpt: ApplicationCommandOption[] = [],
  onlineOpt: ApplicationCommandOption[] = []
): boolean => {
  if (localOpt.length !== onlineOpt.length) {
    return false;
  }

  for (const option of localOpt) {
    const opt = onlineOpt.find((o) => o.name === option.name);

    if (!opt) {
      return false;
    }

    const keys = Object.keys(option) as (keyof ApplicationCommandOption)[];

    for (const key of keys) {
      if (
        ![
          "options",
          "choices",
          "name_localizations",
          "description_localizations",
        ].includes(key)
      ) {
        if (option[key] !== opt[key]) {
          return false;
        }
      }
    }

    if (!compareChoices(option.choices, opt.choices)) {
      return false;
    }

    if (!compareOptions(option.options, opt.options)) {
      return false;
    }
  }

  return true;
};

export const compareCommands = (
  appCmd: CreateGlobalApplicationCommand,
  onlineCmd: ApplicationCommand
): boolean => {
  const keys = Object.keys(appCmd) as (keyof CreateGlobalApplicationCommand)[];

  for (const key of keys) {
    if (
      !["options", "name_localizations", "description_localizations"].includes(
        key
      )
    ) {
      if (appCmd[key] !== onlineCmd[key]) {
        return false;
      }
    }
  }

  return compareOptions(appCmd.options, onlineCmd.options);
};
