import mongoose, { Schema, Document } from "mongoose";

export interface IServerSettings extends Document {
  serverId: string;
  language: "EN" | "PT";
  adminRole: string | null;
  // livechart
  animeChannel: string | null;
  // birthdays
  birthdayChannel: string | null;
  lastBirthdayWishes: number | null;
}

const ServerSettingsSchema: Schema = new mongoose.Schema({
  serverId: String,
  language: String,
  adminRole: String,
  animeChannel: String,
  birthdayChannel: String,
  lastBirthdayWishes: Number,
});

export default mongoose.model<IServerSettings>(
  "ServerSettings",
  ServerSettingsSchema
);
