import { IStore, StoreModel } from "../models/Store.js";
import { StoreDTO } from "../dtos/StoreDTO.js";
import { StoreMapper } from "../mappers/StoreMapper.js";

export class StoreRepository {
  async create(storeData: IStore): Promise<StoreDTO> {
    const store = await StoreModel.create(storeData);
    return StoreMapper.toDTO(store);
  }

  async findAll(): Promise<StoreDTO[]> {
    const stores = await StoreModel.find().lean();
    return StoreMapper.toDTOs(stores);
  }

  async findByNameAndPostalCode(name: string, postalCode: string): Promise<IStore | null> {
    return await StoreModel.findOne({ name, postalCode }).lean();
  }
}