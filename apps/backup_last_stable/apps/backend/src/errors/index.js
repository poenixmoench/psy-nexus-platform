"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.DatabaseError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, code, status = 500) {
        super(message);
        this.code = code;
        this.status = status;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
class DatabaseError extends AppError {
    constructor(message, code = 'DATABASE_ERROR') {
        super(message, code, 500);
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}
exports.DatabaseError = DatabaseError;
class NotFoundError extends AppError {
    constructor(message, code = 'NOT_FOUND') {
        super(message, code, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
