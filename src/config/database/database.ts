import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI
  console.log(mongoURI)
  try {
    await mongoose.connect( mongoURI as any);
    console.log("🟢 Conectado ao MongoDB");
  } catch (error) {
    console.error("🔴 Erro ao conectar ao MongoDB", error);
    process.exit(1);
  }
}