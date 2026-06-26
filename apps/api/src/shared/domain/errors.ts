export class DomainError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 422, "VALIDATION_ERROR");
  }
}
