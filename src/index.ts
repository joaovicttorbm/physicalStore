import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database/database.js";
import storeRoutes from "./routes/StoreRoutes.js";
import logger from "./utils/logger.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    logger.info(`
      Method: ${req.method} 
      Url: ${req.originalUrl} 
      StatusCode: ${res.statusCode}`);
  });
  next();
});

app.use(storeRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
  });

app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
  });
app.listen(3000, () =>  logger.info("Servidor rodando na porta 3000"));




