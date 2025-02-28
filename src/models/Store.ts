import mongoose from "mongoose";

export interface IStore {
  [x: string]: any;
  name: string;
  postalCode: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  latitude: number;
  longitude: number;
  type: "hotel" | "market" | "restaurant";
}

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  neighborhood: { type: String, required: true },
  street: { type: String, required: true },
  number: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  type: {
    type: String,
    required: true,
    enum: ["hotel", "market", "restaurant"],
  },
});

export const StoreModel = mongoose.model("Store", StoreSchema);
