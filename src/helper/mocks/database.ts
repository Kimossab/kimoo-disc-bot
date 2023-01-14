import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export class TestDB {
  public static connect =
    async (): Promise<MongoMemoryServer> => {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();

      await mongoose.connect(uri);
      return mongod;
    };

  public static closeDatabase = async (
    mongod: MongoMemoryServer
  ): Promise<void> => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  };

  public static clearDatabase = async (): Promise<void> => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  };
}
