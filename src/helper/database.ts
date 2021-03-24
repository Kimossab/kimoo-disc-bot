import mongoose from "mongoose";
import achievementModel from "../achievement/models/achievement.model";
import Logger from "./logger";

const _logger = new Logger("database");

/**
 * Connects to a monog DB
 * @param url Database url
 */
const connect = (url: string) => {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on("error", onError);
  mongoose.connection.on("open", onOpen);

  achievementModel.createCollection();
};

const onError = (e: any) => {
  _logger.error("Could not connect to the database.", e);
};

const onOpen = () => {
  _logger.log("Successfully connected to the database.");
};

export default connect;
