import mongoose from "mongoose";
import achievementModel from "../achievement/models/achievement.model";
import Logger from "./logger";

const _logger = new Logger("database");
mongoose.set("strictQuery", true);

/**
 * Connects to a mongo DB
 * @param url Database url
 */
const mongoConnect = async (url: string): Promise<void> => {
  try {
    await mongoose.connect(url);
    _logger.log("Successfully connected to the database.");
  } catch (e) {
    _logger.error(
      `Could not connect to the database (${url}).`,
      e
    );
  }
  achievementModel.createCollection();
};

export default mongoConnect;
