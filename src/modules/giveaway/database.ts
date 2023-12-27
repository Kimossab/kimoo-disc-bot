import GiveawayModel, { IGiveaway } from "./models/Giveaway.model";

export const createGiveaway = async (giveaway: IGiveaway) =>
  GiveawayModel.create(giveaway);

export const getActiveGiveaways = async () =>
  GiveawayModel.find({ winner: null });

export const getGiveawayById = async (giveawayId: string) =>
  GiveawayModel.findById(giveawayId);

export const getGiveaway = async (hash: string) =>
  GiveawayModel.findOne({ hash });
