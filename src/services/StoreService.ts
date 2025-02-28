import axios from "axios";
import { StoreRepository } from "../repositories/StoreRepository.js";
import logger from "../utils/logger.js";
import { IStore } from "../models/Store.js";
import { StoreExistsError } from "../errors/StoreExistsError.js";

export class StoreService {
  private storeRepository: StoreRepository;

  constructor() {
    this.storeRepository = new StoreRepository();
  }

  async addStore(storeData: IStore) {
    try {
      const existingStore = await this.storeRepository.findByNameAndPostalCode(storeData.name, storeData.postalCode);
      if (existingStore) {
        throw new StoreExistsError("A store with the same name and postal code already exists.");
      }
      return await this.storeRepository.create(storeData);
    } catch (error) {
      if (error instanceof StoreExistsError) {
        throw error;
      }
      logger.error("Error adding store:", error);
      throw new Error("Unable to add store");
    }
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const EARTH_RADIUS = 6371; // Radius in kilometers
    const deltaLat = toRad(lat2 - lat1);
    const deltaLon = toRad(lon2 - lon1);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c;
  }

  private async fetchLocationByCep(cep: string) {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search.php?q=${cep}&format=json`);
    if (response.data.error) {
      throw new Error("Invalid CEP");
    }
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
    throw new Error("Coordinates not found.");
  }

  private filterNearbyStores(stores: IStore[], originLat: number, originLon: number, radius: number): any[] {
    return stores
      .map(store => {
        const distance = this.haversineDistance(originLat, originLon, store.latitude, store.longitude);
        return { ...store, distance_km: distance.toFixed(2) }; 
      })
      .filter(store => parseFloat(store.distance_km) <= radius)
      .sort((a, b) => parseFloat(a.distance_km) - parseFloat(b.distance_km));
  }

  async getStoresNearby(cep: string, radius: number = 100) {
    try {
      const { latitude, longitude } = await this.fetchLocationByCep(cep);
      logger.info(`Coordinates for CEP ${cep}: Latitude ${latitude}, Longitude ${longitude}`);

      const stores = await this.storeRepository.findAll();
      const nearbyStores = this.filterNearbyStores(stores, latitude, longitude, radius);

      if (nearbyStores.length === 0) {
        return {};
      }

      return nearbyStores;
    } catch (error) {
      logger.error("Error fetching stores nearby:", error);
      throw new Error("Unable to fetch nearby stores.");
    }
  }
}
