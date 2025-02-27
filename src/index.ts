import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database/database.js";
import storeRoutes from "./routes/StoreRoutes.js";
import logger from "./utils/logger.js";
import axios from "axios";


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(storeRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
  });
app.listen(3000, () =>  logger.info("Servidor rodando na porta 3000"));




