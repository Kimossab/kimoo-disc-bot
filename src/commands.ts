import { APIApplicationCommand, APIApplicationCommandOption, APIApplicationCommandOptionChoice, APIApplicationCommandStringOption, APIApplicationCommandSubcommandOption, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

const compareChoices = (
  localChoices: APIApplicationCommandOptionChoice<string>[] = [],
  onlineChoices: APIApplicationCommandOptionChoice<string>[] = []
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
  localOpt: APIApplicationCommandOption[] = [],
  onlineOpt: APIApplicationCommandOption[] = []
): boolean => {
  if (localOpt?.length !== onlineOpt?.length) {
    return false;
  }

  for (const option of localOpt) {
    const opt = onlineOpt.find((o) => o.name === option.name);

    if (!opt) {
      return false;
    }

    const keys = Object.keys(option) as (keyof APIApplicationCommandOption)[];

    for (const key of keys) {
      if (
        ![
          "options",
          "choices",
          "name_localizations",
          "description_localizations"
        ].includes(key)
      ) {
        if (option[key] !== opt[key]) {
          return false;
        }
      }
    }

    // we can cast option as any type with choices as we're just comparing values regardless of types
    if (!compareChoices((option as APIApplicationCommandStringOption).choices, (opt as APIApplicationCommandStringOption).choices)) {
      return false;
    }

    // same here, we want to compare each sub option
    if (!compareOptions((option as APIApplicationCommandSubcommandOption).options, (opt as APIApplicationCommandSubcommandOption).options)) {
      return false;
    }
  }

  return true;
};

export const compareCommands = (
  appCmd: RESTPostAPIApplicationCommandsJSONBody,
  onlineCmd: APIApplicationCommand
): boolean => {
  const keys = Object.keys(appCmd) as (keyof RESTPostAPIApplicationCommandsJSONBody)[];

  for (const key of keys) {
    if (
      !["options", "name_localizations", "description_localizations"].includes(key)
    ) {
      if (appCmd[key] !== onlineCmd[key as keyof APIApplicationCommand]) {
        return false;
      }
    }
  }

  return compareOptions(appCmd.options as APIApplicationCommandOption[], onlineCmd.options as APIApplicationCommandOption[]);
};
