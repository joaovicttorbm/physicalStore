import mongoose from "mongoose";
export interface IStore {
  name: string;
  cep: string;
  cidade: string;
  bairro: string;
  rua: string;
  num: string;
  latitude: number;
  longitude: number;
  type: "hotel" | "mercado" | "restaurante";
}

const StoreSchema  = new mongoose.Schema({
  name: { type: String, required: true },
  cep: { type: String, required: true },
  cidade: { type: String, required: true },
  bairro: { type: String, required: true },
  rua: { type: String, required: true },
  num: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ["hotel", "mercado", "restaurante"],
  },
});

export const StoreModel = mongoose.model("Store", StoreSchema);
