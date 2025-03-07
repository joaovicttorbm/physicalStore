import { Request, Response } from "express";
import { StoreService } from "../services/StoreService.js";
import { StoreExistsError } from "../errors/StoreExistsError.js";
import logger from "../utils/logger.js";

export class StoreController {
  constructor(private readonly storeService: StoreService = new StoreService()) {}

  createStore = async (req: Request, res: Response): Promise<void> => {
    try {
      const store = await this.storeService.addStore(req.body.validatedAddress);
      res.status(201).json(store);
    } catch (error) {
      this.handleCreateStoreError(res, error);
    }
  }

  findStores = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cep } = req.params;
      const radius = this.parseRadius(req.query.radius);
      const type = req.query.type ? this.validateStoreType(req.query.type as string) : undefined;
      const stores = await this.storeService.getStoresNearby(cep, radius, type );
      if (stores.length === 0) {
        res.status(404).json({ message: "No stores found nearby." });
      }  else {
      res.json(stores);
      }
      
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private parseRadius(radius: any): number {
    return isNaN(radius) ? 100 : parseFloat(radius);
  }

  private validateStoreType(type: string): string | undefined {
    const validTypes = ["hotel", "market", "restaurant"];
    if (type && !validTypes.includes(type)) {
      throw new Error(`Invalid type. Allowed values: ${validTypes.join(", ")}`);
    }
    return type;
  }

  private handleCreateStoreError(res: Response, error: any): void {
    if (error instanceof StoreExistsError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unable to add store" });
    }
  }

  private handleError(res: Response, error: any): void {
    logger.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
