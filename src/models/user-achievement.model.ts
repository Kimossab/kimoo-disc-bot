import mongoose, { Schema, Document } from "mongoose";
import { IAchievement } from "./achievement.model";

export interface IUserAchievement extends Document {
  user: string;
  server: string;
  awardDate: Date;
  achievement: IAchievement;
}

const UserAchievementSchema: Schema = new mongoose.Schema({
  user: String,
  server: String,
  awardDate: Date,
  achievement: {
    type: Schema.Types.ObjectId,
    ref: "Achievement"
  }
});

export default mongoose.model<IUserAchievement>(
  "UserAchievement",
  UserAchievementSchema
);
