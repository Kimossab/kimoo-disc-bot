import mongoose, { Document, Schema } from "mongoose";

export interface IGiveaway {
  serverId: string;
  channelId: string;
  hash: string;
  creatorId: string;
  endAt: Date;
  winner: string | null;
  participants: string[];
  prize: string;
}

export type IGiveawayDocument = Document & IGiveaway;

const GiveawaySchema: Schema = new mongoose.Schema({
  serverId: String,
  messageId: String,
  channelId: String,
  hash: String,
  creatorId: String,
  endAt: Date,
  winner: String,
  participants: [String],
  prize: String,
});

export default mongoose.model<IGiveawayDocument>("Giveaway", GiveawaySchema);
