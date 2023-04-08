import mongoose, { Schema } from "mongoose";

export interface IAnilistSubscription {
  id: number;
  user: string;
  server: string;
}

const AnilistSubscriptionSchema: Schema = new mongoose.Schema({
  id: Number,
  user: String,
  server: String,
});

export default mongoose.model<IAnilistSubscription>(
  "AnilistSubscription",
  AnilistSubscriptionSchema
);
