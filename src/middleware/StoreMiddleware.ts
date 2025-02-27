import { Request, Response, NextFunction } from "express";
import axios from "axios";

class StoreMiddleware {
  async validateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cep, name, cidade, bairro, rua, num, type } = req.body;

      const requiredFields = ["cep", "name", "cidade", "bairro", "rua", "num", "type"];
      for (const field of requiredFields) {
        if (!req.body[field]) {
           res.status(400).json({ error: `O campo '${field}' é obrigatório!` });
        }
      }

      if (!["hotel", "mercado", "restaurante"].includes(type)) {
         res.status(400).json({ error: "Tipo inválido! Use: hotel, mercado ou restaurante." });
      }

      const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const cidadeViaCep = viaCepResponse.data.localidade;
      const bairroViaCep = viaCepResponse.data.bairro;

      const nominatimResponse = await axios.get(`https://nominatim.openstreetmap.org/search.php?q=${cidadeViaCep}+${bairroViaCep}&format=json`);
      if (nominatimResponse.data.length === 0) {
        throw new Error("CEP inválido!");
      }
      const location = nominatimResponse.data[0];
      console.log("Latitude:", location.lat, "Longitude:", location.lon);

      req.body.validatedAddress = {
        name: name.toUpperCase(),
        cep,
        cidade: cidadeViaCep,
        bairro: bairroViaCep,
        rua,
        num,
        latitude: location.lat,
        longitude: location.lon,
        type,
      };

      next();
    } catch (error) {
      next(error); // Encaminha o erro para o middleware de erro padrão
    }
  }
}

export default new StoreMiddleware();
