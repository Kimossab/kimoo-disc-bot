import mongoose, { Document, Schema } from "mongoose";

export interface IPoll {
  hash: string;
  creator: string;
  question: string;
  options: {
    text: string;
    votes: string[];
  }[];
  multipleChoice: boolean;
  usersCanAddAnswers: boolean;
  days: number;
  startAt: Date;
}

export type IPollDocument = Document & IPoll;

const PollSchema: Schema = new mongoose.Schema({
  hash: String,
  creator: String,
  question: String,
  options: [
    new mongoose.Schema({
      text: String,
      votes: [String],
    }),
  ],
  multipleChoice: Boolean,
  usersCanAddAnswers: Boolean,
  days: Number,
  startAt: Date,
});

export default mongoose.model<IPollDocument>("Poll", PollSchema);
