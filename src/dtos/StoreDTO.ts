export interface StoreDTO {
  id: string;
  name: string;
  postalCode: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  type: "hotel" | "market" | "restaurant";
  distance_km: string;
  latitude: number;
  longitude: number;
}