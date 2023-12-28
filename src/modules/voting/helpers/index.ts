import { Poll } from "@prisma/client";

export const hasExpired = (poll: Poll): boolean => {
  const daysInSeconds = poll.days * 60 * 60 * 24 * 1000;
  const endingDate = +poll.startAt + daysInSeconds;

  return +new Date() > endingDate;
};
