import { IStore, StoreModel } from "../models/Store.js";

export class StoreRepository {
  async create(storeData: IStore): Promise<any> {
    return await StoreModel.create(storeData);
  }

  async findAll(): Promise<IStore[]> {
    return await StoreModel.find().lean();
  }
}