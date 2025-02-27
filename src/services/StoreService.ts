import axios from "axios";
import { StoreRepository } from "../repositories/StoreRepository.js";
import logger from "../utils/logger.js";

export class StoreService {
  private storeRepository: StoreRepository;

  constructor() {
    this.storeRepository = new StoreRepository();
  }

  async addStore(storeData: any) {

    return await this.storeRepository.create(storeData);
  }

//   fórmula de Haversine para calcular a distância entre as coordenadas geográficas.
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const RaioTerra = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
    // Calcula o quadrado do seno da metade da diferença de latitude.
    // Isso ajuda a medir a variação da latitude entre os dois pontos.
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    // Converte as latitudes para radianos e aplica o cosseno.
    // Isso leva em consideração a curvatura da Terra, garantindo mais precisão.
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
    // Calcula o quadrado do seno da metade da diferença de longitude.
    // Mede a variação da longitude entre os dois pontos.
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    // atan2 calcular o ângulo central entre os pontos.
    // sqt return tangent
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    console.log("haversineDistance: ",RaioTerra * c)
    return RaioTerra * c;
  }

  async getStoresNearby(cep: string, radius: number = 100) {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search.php?q=${cep}&format=json`);
    if (response.data.erro) throw new Error("CEP inválido!");
  
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      const latitude = parseFloat(location.lat);
      const longitude = parseFloat(location.lon);

      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      const stores = await this.storeRepository.findAll();
      console.log(stores);
    const nearbyStores = stores
      // .map(store => ({
      //   ...store,
      //   distance: this.haversineDistance(latitude, longitude, store.latitude, store.longitude),
      // }))
      .map(store => {
        
        const distance = this.haversineDistance(latitude, longitude, store.latitude, store.longitude);
        console.log(`Origem: (${latitude}, ${longitude})`);
        console.log(`Destino: (${ store.latitude}, ${store.longitude})`);
        
        return { ...store, distance };
      })
      .filter(store => store.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
      console.log(nearbyStores)

    if (nearbyStores.length === 0) return({});

    return nearbyStores;
    } else {
      throw new Error('Coordenadas não encontradas.');
    }    
  }
}