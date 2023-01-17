import mongoose, { Document, Schema } from "mongoose";

export interface IBirthday extends Document {
  day: number;
  month: number;
  year: number | null;
  user: string;
  server: string;
  lastWishes: number | null;
}

const BirthdaySchema: Schema<IBirthday> = new mongoose.Schema({
  day: Number,
  month: Number,
  year: Number,
  user: String,
  server: String,
  lastWishes: Number,
});

export default mongoose.model<IBirthday>("Birthday", BirthdaySchema);
