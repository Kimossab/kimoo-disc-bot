import mongoose, { Schema, Document } from 'mongoose';

export interface ILivechartAnimeInfo extends Document {
  id: number;
  title: Nullable<string>;
  description: Nullable<string>;
  image: Nullable<string>;
  url: string;
}

const LivechartAnimeInfoSchema: Schema = new mongoose.Schema({
  timestamp: Number,
  id: String,
  title: String,
  description: String,
  image: String,
  url: String,
});

export default mongoose.model<ILivechartAnimeInfo>(
  'LivechartAnimeInfo',
  LivechartAnimeInfoSchema
);
