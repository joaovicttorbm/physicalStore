import { Request, Response, NextFunction } from "express";
import axios from "axios";

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


      const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${postalCode}/json/`);
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

      const nominatimResponse = await axios.get(`https://nominatim.openstreetmap.org/search.php?q=${cityFromViaCep}+${neighborhoodFromViaCep}&format=json`);
      if (nominatimResponse.data.length === 0) {
        throw new Error("Invalid ZIP code!");
      }
      const location = nominatimResponse.data[0];
      console.log("Latitude:", location.lat, "Longitude:", location.lon);

      
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
      next(error);
      return
    }
  }
}

export default new StoreMiddleware();
