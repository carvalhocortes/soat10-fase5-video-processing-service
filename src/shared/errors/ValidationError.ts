import { BaseError } from './BaseError';

export class ValidationError extends BaseError {
  public code: string = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}
