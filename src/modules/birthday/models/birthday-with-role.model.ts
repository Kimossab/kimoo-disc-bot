import mongoose, { Schema } from "mongoose";

export interface IBirthdayWithRole {
  day: number;
  month: number;
  users: string[];
  server: string;
}

const BirthdayWithRoleSchema: Schema<IBirthdayWithRole> = new Schema({
  day: Number,
  month: Number,
  users: [String],
  server: String,
});

export default mongoose.model<IBirthdayWithRole>(
  "BirthdayWithRole",
  BirthdayWithRoleSchema
);
