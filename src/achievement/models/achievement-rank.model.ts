import mongoose, { Document, Schema } from "mongoose";

export interface IAchievementRank extends Document {
  server: string;
  name: string;
  points: number;
}

const AchievementRankSchema: Schema = new mongoose.Schema({
  server: String,
  name: String,
  points: Number,
});

export default mongoose.model<IAchievementRank>(
  "AchievementRank",
  AchievementRankSchema
);
