import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  id: number;
  name: string;
  description: string;
  image: string | null;
  server: string;
  points: number;
}

const AchievementSchema: Schema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  image: String,
  server: String,
  points: Number,
});

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
