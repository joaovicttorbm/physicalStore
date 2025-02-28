import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../../utils/logger.js";

dotenv.config();

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI
  try {
    await mongoose.connect( mongoURI as any);
    logger.info("🟢 Conected  MongoDB");
  } catch (error) {
    logger.error("🔴 Error conect MongoDB", error);
    process.exit(1);
  }
}