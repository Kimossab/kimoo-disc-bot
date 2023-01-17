import mongoose, { Document, Schema } from "mongoose";

export interface IAnilistSubscription extends Document {
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
