import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { ViaCepAdapter, NominatimAdapter } from "../services/AddressAdapters.js";

class StoreMiddleware {
  constructor(
    private readonly viaCepAdapter = new ViaCepAdapter(),
    private readonly nominatimAdapter = new NominatimAdapter()
  ) {
    this.validateAddress = this.validateAddress.bind(this);
    this.validateFindStore = this.validateFindStore.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  async validateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.validateRequiredFields(req.body, res);
      this.validateType(req.body.type, res);

      const viaCepData = await this.viaCepAdapter.getAddress(req.body.postalCode);
      this.validateCity(req.body.city, viaCepData.localidade, res);
      this.validateNeighborhood(req.body.neighborhood, viaCepData.bairro, res);

      const location = await this.nominatimAdapter.getCoordinates(viaCepData.localidade, viaCepData.bairro);
      this.attachValidatedAddress(req, location, viaCepData);

      next();
    } catch (error) {
      this.handleError(error, next);
    }
  }

  validateFindStore(req: Request, res: Response, next: NextFunction): void {
    if (!this.isValidCep(req.params.cep, res)) return;
    if (req.query.type && !this.isValidStoreType(req.query.type as string, res)) return;
    next();
  }

  private validateRequiredFields(body: any, res: Response): void {
    const requiredFields = ["postalCode", "name", "city", "neighborhood", "street", "number", "type"];
    requiredFields.forEach((field) => {
      if (!body[field]) {
        this.respondWithBadRequest(res, `The field '${field}' is required!`);
      }
    });
  }

  private validateType(type: string, res: Response): void {
    const validTypes = ["hotel", "market", "restaurant"];
    if (!validTypes.includes(type)) {
      this.respondWithBadRequest(res, "Invalid type! Use: hotel, market or restaurant.");
    }
  }

  private validateCity(city: string, expectedCity: string, res: Response): void {
    if (city.toUpperCase() !== expectedCity.toUpperCase()) {
      this.respondWithBadRequest(res, `City does not match the provided ZIP code! Expected: ${expectedCity}`);
    }
  }

  private validateNeighborhood(neighborhood: string, expectedNeighborhood: string, res: Response): void {
    if (neighborhood.toUpperCase() !== expectedNeighborhood.toUpperCase()) {
      this.respondWithBadRequest(res, `Neighborhood does not match the provided ZIP code! Expected: ${expectedNeighborhood}`);
    }
  }

  private attachValidatedAddress(req: Request, location: any, viaCepData: any): void {
    req.body.validatedAddress = {
      name: req.body.name.toUpperCase(),
      postalCode: req.body.postalCode,
      city: viaCepData.localidade,
      neighborhood: viaCepData.bairro,
      street: req.body.street,
      number: req.body.number,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      type: req.body.type,
    };
  }

  private isValidCep(cep: string, res: Response): boolean {
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    if (!cepRegex.test(cep)) {
      this.respondWithBadRequest(res, "Invalid CEP format. Expected format: 12345-678 or 12345678.");
      return false;
    }
    return true;
  }

  private isValidStoreType(type: string, res: Response): boolean {
    const validTypes = ["hotel", "market", "restaurant"];
    if (!validTypes.includes(type)) {
      this.respondWithBadRequest(res, `Invalid type. Allowed values: ${validTypes.join(", ")}`);
      return false;
    }
    return true;
  }

  private respondWithBadRequest(res: Response, message: string): void {
    res.status(400).json({ error: message });
    throw new Error(message); 
  }

  private handleError(error: any, next: NextFunction): void {
    logger.error(error);
    next(error);
  }
}

export default new StoreMiddleware();
