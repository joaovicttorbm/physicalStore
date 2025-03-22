import axios from "axios";

export class ViaCepAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.VIACEP_URL || "https://viacep.com.br/ws/";
  }

  async getAddress(postalCode: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}${postalCode}/json/`);
    if (!response.data || response.data.erro) {
      throw new Error("Invalid ZIP code!");
    }
    return response.data;
  }
}

export class NominatimAdapter {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org/search?q=";
  }

  async getCoordinates(city: string, neighborhood: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}${city}+${neighborhood}&format=json`);
    if (!response.data || response.data.length === 0) {
      throw new Error("Invalid location data!");
    }
    return response.data[0];
  }
}