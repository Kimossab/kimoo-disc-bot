import mongoose, { Schema } from "mongoose";

export interface IRoleCategory {
  server: string;
  message: string;
  category: string;
  roles: {
    role: string;
    icon: string | null;
  }[];
}

const RoleCategorySchema: Schema = new mongoose.Schema({
  server: String,
  message: String,
  category: String,
  roles: [{ role: String, icon: String }],
});

export default mongoose.model<IRoleCategory>(
  "RoleCategory",
  RoleCategorySchema
);
