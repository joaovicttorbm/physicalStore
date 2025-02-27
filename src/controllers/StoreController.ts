import { Request, Response } from "express";
import { StoreService } from "../services/StoreService.js";

export class StoreController {
  constructor(private readonly storeService: StoreService = new StoreService()) {}

  async createStore(req: Request, res: Response): Promise<void> {
    try {
      const store = await this.storeService.addStore(req.body.validatedAddress);
      res.status(201).json(store);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async findStores(req: Request, res: Response): Promise<void> {
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
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
