export class BaseError extends Error {
  public code: string = 'GENERIC_ERROR';

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
