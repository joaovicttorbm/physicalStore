import { IStore } from "../models/Store.js";
import { StoreDTO } from "../dtos/StoreDTO.js";

export class StoreMapper {
  static toDTO(store: IStore): StoreDTO {
    return {
      id: store._id.toString(),
      name: store.name,
      postalCode: store.postalCode,
      city: store.city,
      neighborhood: store.neighborhood,
      street: store.street,
      number: store.number,
      type: store.type,
      distance_km: store.distance !== undefined ? store.distance.toFixed(2) : "0.00",
      latitude: store.latitude,
      longitude: store.longitude
    };
  }

  static toDTOs(stores: IStore[]): StoreDTO[] {
    return stores.map(StoreMapper.toDTO);
  }
}