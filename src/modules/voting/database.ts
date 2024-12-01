import { Poll, PollOption } from "@prisma/client";
import prisma from "@/database";

export const createVoting = async (
  poll: Omit<Poll, "id">,
  options: Omit<PollOption, "id" | "pollId">[],
) => await prisma.poll.create({
  data: {
    ...poll,
    pollOptions: { create: options },
  },
  include: { pollOptions: { include: { pollOptionVotes: true } } },
});

export const updateHash = async (id: string, hash: string) => await prisma.poll.update({
  where: { id },
  data: { hash },
});

export const getPoll = async (hash: string) => prisma.poll.findFirst({
  where: { hash },
  include: { pollOptions: { include: { pollOptionVotes: true } } },
});

export const createOption = async (poll: string, option: string) => await prisma.pollOption.create({
  data: {
    pollId: poll,
    text: option,
  },
});

export const createOptionVote = async (option: string, user: string) => await prisma.pollOptionVotes.create({
  data: {
    pollOptionId: option,
    user,
  },
});

export const deleteOptionVote = async (option: string, user: string) => await prisma.pollOptionVotes.deleteMany({
  where: {
    pollOptionId: option,
    user,
  },
});

export const deleteAllVotes = async (poll: string) => await prisma.pollOptionVotes.deleteMany({ where: { option: { pollId: poll } } });

export type CompletePoll = NonNullable<ThenArg<ReturnType<typeof getPoll>>>;
