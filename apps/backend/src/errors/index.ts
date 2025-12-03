export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  constructor(message: string, code: string, status: number = 500) {
    super(message);
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
export class DatabaseError extends AppError {
  constructor(message: string, code: string = 'DATABASE_ERROR') {
    super(message, code, 500);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
export class NotFoundError extends AppError {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(message, code, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
