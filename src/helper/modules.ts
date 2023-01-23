import { CommandInteractionDataOption } from "@/types/discord";

export const getOptions = <T>(
  optionKeys: (keyof T)[],
  options?: CommandInteractionDataOption[]
): T => {
  const response: T = {} as T;
  for (const key of optionKeys) {
    response[key] = getOptionValue(
      options,
      key as string
    ) as unknown as T[keyof T];
  }

  return response;
};

export const getOptionValue = <T extends CommandInteractionDataOption["value"]>(
  options: CommandInteractionDataOption[] | undefined,
  name: string
): T | null => {
  const opt = options?.find((o) => o.name === name);

  return opt ? (opt.value as T) : null;
};
export const getOption = (
  options: CommandInteractionDataOption[] | undefined,
  name: string
): CommandInteractionDataOption | null => {
  const opt = options?.find((o) => o.name === name);

  return opt || null;
};
