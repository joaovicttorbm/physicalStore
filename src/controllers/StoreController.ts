import { Request, Response } from "express";
import { StoreService } from "../services/StoreService.js";
import { StoreExistsError } from "../errors/StoreExistsError.js";
import logger from "../utils/logger.js";

export class StoreController {
constructor(  private readonly storeService: StoreService = new StoreService()) {  }

  createStore = async (req: Request, res: Response): Promise<void> =>{
    try {
      const store = await this.storeService.addStore(req.body.validatedAddress);
      res.status(201).json(store);
    } catch (error) {
      if (error instanceof StoreExistsError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Unable to add store" });
      }
    }
  }

  findStores =  async (req: Request, res: Response): Promise<void> =>{
    try {
      const { cep } = req.params;
      const radius = this.parseRadius(req.query.radius);
      const stores = await this.storeService.getStoresNearby(cep, radius);
      res.json(stores);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private parseRadius(radius: any): number {
    return isNaN(radius) ? 100 : parseFloat(radius);
  }

  private handleError(res: Response, error: any): void {
    logger.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
