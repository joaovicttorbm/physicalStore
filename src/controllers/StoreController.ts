import { Request, Response } from "express";
import { StoreService } from "../services/StoreService.js";
import logger from "../utils/logger.js";

const storeService = new StoreService();

export class StoreController {
  async createStore(req: Request, res: Response) {
    try {
      const store = await storeService.addStore(req.body.validatedAddress);
      res.status(201).json(store);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findStores(req: Request, res: Response) {
    try {
      const { cep } = req.params;
      console.log(cep)
      const radius = parseFloat(req.query.radius as string) || 100;
      const stores = await storeService.getStoresNearby(cep, radius);
      res.json(stores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
