import mongoose, { Schema, Document } from "mongoose";

export interface IAnimeNotification extends Document {
  id: number;
  nextAiring: number | null;
}

const AnimeNotificationSchema: Schema = new mongoose.Schema(
  {
    id: Number,
    nextAiring: Number,
  }
);

export default mongoose.model<IAnimeNotification>(
  "AnimeNotification",
  AnimeNotificationSchema
);
