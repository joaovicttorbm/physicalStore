export class StoreExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreExistsError";
  }
}