import mongoose, { ObjectId, Schema } from "mongoose";

interface _IBadge {
  name: string;
  server: string;
  fileExtension: string;
}
export interface IBadge extends _IBadge {
  _id: ObjectId;
}

const BadgeSchema: Schema<IBadge> = new mongoose.Schema<IBadge>({
  name: String,
  server: String,
  fileExtension: String,
});

export default mongoose.model<IBadge>("Badge", BadgeSchema);
