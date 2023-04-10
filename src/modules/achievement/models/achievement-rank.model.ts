import mongoose, { Schema } from "mongoose";

export interface IAchievementRank {
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
