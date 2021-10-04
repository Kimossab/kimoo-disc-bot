export const getOptionValue = <T>(
  options:
    | discord.application_command_interaction_data_option[]
    | undefined,
  name: string
): T | null => {
  const opt = options?.find((o) => o.name === name);

  return opt ? (opt.value as T) : null;
};
export const getOption = (
  options:
    | discord.application_command_interaction_data_option[]
    | undefined,
  name: string
): discord.application_command_interaction_data_option | null => {
  const opt = options?.find((o) => o.name === name);

  return opt || null;
};
