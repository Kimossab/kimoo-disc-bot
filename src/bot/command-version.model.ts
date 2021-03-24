import mongoose, { Schema, Document } from "mongoose";

export interface ICommandVersion extends Document {
  lastUpdate: Date;
  version: string;
}

const CommandVersionSchema: Schema = new mongoose.Schema({
  lastUpdate: Date,
  version: String,
});

export default mongoose.model<ICommandVersion>(
  "CommandVersion",
  CommandVersionSchema
);
