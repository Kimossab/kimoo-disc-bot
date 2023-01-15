import mongoose, { Document, Schema } from "mongoose";

export interface IServerSettings extends Document {
  serverId: string;
  language: "EN" | "PT";
  adminRole: string | null;
  // livechart
  animeChannel: string | null;
  // birthdays
  birthdayChannel: string | null;
  lastBirthdayWishes: number | null;
  birthdayRole: string | null;
}

const ServerSettingsSchema: Schema = new mongoose.Schema({
  serverId: String,
  language: String,
  adminRole: String,
  animeChannel: String,
  birthdayChannel: String,
  lastBirthdayWishes: Number,
  birthdayRole: String,
});

export default mongoose.model<IServerSettings>(
  "ServerSettings",
  ServerSettingsSchema
);
