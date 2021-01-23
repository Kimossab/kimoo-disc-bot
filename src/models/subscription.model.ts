import mongoose, { Schema, Document } from "mongoose";

export interface ILivechartSubscription extends Document {
  id: number;
  server: string;
  user: string;
}

const LivechartSubscriptionSchema: Schema = new mongoose.Schema({
  id: Number,
  server: String,
  user: String,
});

export default mongoose.model<ILivechartSubscription>(
  "LivechartSubscription",
  LivechartSubscriptionSchema
);
