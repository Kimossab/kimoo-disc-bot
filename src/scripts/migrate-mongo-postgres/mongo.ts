import Logger from "../../helper/logger";
import mongoose from "mongoose";

const _logger = new Logger("database");
mongoose.set("strictQuery", true);

/**
 * Connects to a mongo DB
 * @param url Database url
 */
const mongoConnect = async (url: string): Promise<void> => {
  try {
    await mongoose.connect(url);
    _logger.info("Successfully connected to the database.");
  } catch (e) {
    _logger.error(`Could not connect to the database (${url}).`, e);
  }
};

export default mongoConnect;
