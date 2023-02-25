import mongoose, { Document, Schema } from "mongoose";

export interface ILastAiredNotification {
  id: number;
  lastAired: number | null;
  lastUpdated: Date | null;
}
export type ILastAiredNotificationDocument = Document & ILastAiredNotification;

const LastAiredNotificationSchema: Schema = new mongoose.Schema({
  id: Number,
  lastAired: Number,
  lastUpdated: Date,
});

export default mongoose.model<ILastAiredNotificationDocument>(
  "LastAiredNotification",
  LastAiredNotificationSchema
);
