import { IBadge } from "./badges.model";
import mongoose, { Document, Schema } from "mongoose";

export interface IUserBadge extends Document {
  user: string;
  server: string;
  awardDate: Date;
  badge: IBadge;
}

const UserBadgeSchema: Schema<IUserBadge> =
  new mongoose.Schema<IUserBadge>({
    user: String,
    server: String,
    awardDate: Date,
    badge: {
      type: Schema.Types.ObjectId,
      ref: "Badge",
    },
  });

export default mongoose.model<IUserBadge>(
  "UserBadge",
  UserBadgeSchema
);
