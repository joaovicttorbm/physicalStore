import { Request, Response, NextFunction } from "express";
import axios from "axios";
import logger from "../utils/logger.js";

class StoreMiddleware {
  async validateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postalCode, name, city, neighborhood, street, number, type } = req.body;

      const requiredFields = ["postalCode", "name", "city", "neighborhood", "street", "number", "type"];
      for (const field of requiredFields) {
        if (!req.body[field]) {
           res.status(400).json({ error: `The field '${field}' is required!` });
           return
        }
      }

      if (!["hotel", "market", "restaurant"].includes(type)) {
         res.status(400).json({ error: "Invalid type! Use: hotel, market or restaurant." });
         return
      }
      const viaCep = process.env.VIACEP_URL;
      const viaCepResponse = await axios.get(`${viaCep}${postalCode}/json/`);
      const cityFromViaCep = viaCepResponse.data.localidade;
      const neighborhoodFromViaCep = viaCepResponse.data.bairro;
      
      if (city.toUpperCase() !== cityFromViaCep.toUpperCase()) {
         res.status(400).json({ error: `City does not match the provided ZIP code! Expected: ${cityFromViaCep}` });
         return
      }

      if (neighborhood.toUpperCase() !== neighborhoodFromViaCep.toUpperCase()) {
         res.status(400).json({ error: `Neighborhood does not match the provided ZIP code! Expected: ${neighborhoodFromViaCep}` });
         return
      }
      
      const nominatim = process.env.NOMINATIM_URL;
      const nominatimResponse = await axios.get(`${nominatim}${cityFromViaCep}+${neighborhoodFromViaCep}&format=json`);
      if (nominatimResponse.data.length === 0) {
        throw new Error("Invalid ZIP code!");
      }
      const location = nominatimResponse.data[0];
      
      req.body.validatedAddress = {
        name: name.toUpperCase(),
        postalCode,
        city: cityFromViaCep,
        neighborhood: neighborhoodFromViaCep,
        street,
        number,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        type,
      };

      next();
    } catch (error) {
      logger.error(error)
      next(error);
    }
  }
  validateFindStore = (req: Request, res: Response, next: NextFunction): void => {
    if (!this.validateCep(req.params.cep, res)) return;
    if (req.query.type && !this.validateStoreType(req.query.type as string, res)) return;
    next();
  };
  private validateStoreType(type: string, res: Response): boolean | undefined {
    const validTypes = ["hotel", "market", "restaurant"];
    if (type && !validTypes.includes(type)) {
      res.status(400).json({ message: `Invalid type. Allowed values: ${validTypes.join(", ")}` });
      return false;
    }
    return true;

  }
  private validateCep(cep: string, res: Response): boolean | undefined {
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
  
    if (!cepRegex.test(cep)) {  
       res.status(400).json({ message:"Invalid CEP format. Expected format: 12345-678 or 12345678."} );
      return false;
    }
      
    return true;
  }
}

export default new StoreMiddleware();
