import { AppDataSource } from "./ormconfig";

export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
