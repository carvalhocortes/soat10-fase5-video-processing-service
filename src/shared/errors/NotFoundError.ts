import { BaseError } from './BaseError';

export class NotFoundError extends BaseError {
  public code: string = 'NOT_FOUND';

  constructor(message: string) {
    super(message);
  }
}
