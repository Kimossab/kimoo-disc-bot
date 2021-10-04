import mongoose, { Schema, Document } from "mongoose";

export interface IBadge extends Document {
  name: string;
  server: string;
  fileExtension: string;
}

const BadgeSchema: Schema<IBadge> =
  new mongoose.Schema<IBadge>({
    name: String,
    server: String,
    fileExtension: String,
  });

export default mongoose.model<IBadge>("Badge", BadgeSchema);
