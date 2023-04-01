import { IPoll } from "#voting/models/Poll.model";

export const hasExpired = (poll: IPoll): boolean => {
  const daysInSeconds = poll.days * 60 * 60 * 24 * 1000;
  const endingDate = +poll.startAt + daysInSeconds;

  return +new Date() > endingDate;
};
