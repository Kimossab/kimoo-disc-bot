import { IBadge } from "./badges.model";
import mongoose, { Schema } from "mongoose";

export interface IUserBadge {
  user: string;
  server: string;
  awardDate: Date;
  badge: IBadge;
}

const UserBadgeSchema: Schema<IUserBadge> = new mongoose.Schema<IUserBadge>({
  user: String,
  server: String,
  awardDate: Date,
  badge: {
    type: Schema.Types.ObjectId,
    ref: "Badge",
  },
});

export default mongoose.model<IUserBadge>("UserBadge", UserBadgeSchema);
