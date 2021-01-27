import mongoose, { Schema, Document } from "mongoose";

export interface ILivechartLastRequest extends Document {
  timestamp: number;
}

const LivechartLastRequestSchema: Schema = new mongoose.Schema({
  timestamp: Number,
});

export default mongoose.model<ILivechartLastRequest>(
  "LivechartLastRequest",
  LivechartLastRequestSchema
);
