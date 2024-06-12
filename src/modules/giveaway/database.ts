import prisma from "@/database";
import { Giveaway, GiveawayParticipant } from "@prisma/client";

export const createGiveaway = async (giveaway: Omit<Giveaway, "id">) => await prisma.giveaway.create({
  data: giveaway,
  include: {
    participants: true
  }
});

export const updateHash = async (id: string, hash: string) => await prisma.giveaway.update({
  where: { id },
  data: { hash },
  include: {
    participants: true
  }
});

export const getGiveaway = async (hash: string) => prisma.giveaway.findFirst({
  where: { hash },
  include: {
    participants: true
  }
});

export const getActiveGiveaways = async () => prisma.giveaway.findMany({
  where: {
    endAt: {
      gte: new Date()
    }
  },
  include: {
    participants: true
  }
});

export const createParticipant = (participant: Omit<GiveawayParticipant, "id">) => prisma.giveawayParticipant.create({
  data: participant
});

export const removeParticipant = (id: string) => prisma.giveawayParticipant.delete({
  where: { id }
});

export const removeWinnerAndDisable = (id: string) => prisma.giveawayParticipant.update({
  where: { id },
  data: {
    isWinner: false,
    canWin: false
  }
});

export const setWinner = (id: string) => prisma.giveawayParticipant.update({
  where: { id },
  data: { isWinner: true }
});

export type CompleteGiveaway = NonNullable<
  ThenArg<ReturnType<typeof getGiveaway>>
>;
