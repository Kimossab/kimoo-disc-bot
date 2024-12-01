import { APIApplicationCommandInteractionDataBasicOption, APIApplicationCommandInteractionDataOption } from "discord-api-types/v10";

export const getOptions = <T>(
  optionKeys: (keyof T)[],
  options?: APIApplicationCommandInteractionDataBasicOption[],
): T => {
  const response: T = {} as T;
  for (const key of optionKeys) {
    response[key] = getOptionValue(
      options,
      key as string,
    ) as unknown as T[keyof T];
  }

  return response;
};

export const getOptionValue = <T extends APIApplicationCommandInteractionDataBasicOption["value"]>(
  options: APIApplicationCommandInteractionDataBasicOption[] | undefined,
  name: string,
): T | null => {
  const opt = options?.find(o => o.name === name);

  return opt
    ? (opt.value as T)
    : null;
};
export const getOption = (
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string,
): APIApplicationCommandInteractionDataOption | null => {
  const opt = options?.find(o => o.name === name);

  return opt || null;
};
