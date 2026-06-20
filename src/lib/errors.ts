export class NotFoundError extends Error {
  constructor(entityType: string, id: string) {
    super(`${entityType} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class StorageUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Storage is not available');
    this.name = 'StorageUnavailableError';
    this.cause = cause;
  }
}
