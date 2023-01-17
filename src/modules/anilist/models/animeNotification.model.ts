import mongoose, { Document, Schema } from "mongoose";

export interface IAnimeNotification {
  id: number;
  nextAiring: number | null;
}
export type IAnimeNotificationDocument = Document & IAnimeNotification;

const AnimeNotificationSchema: Schema = new mongoose.Schema({
  id: Number,
  nextAiring: Number,
});

export default mongoose.model<IAnimeNotificationDocument>(
  "AnimeNotification",
  AnimeNotificationSchema
);
