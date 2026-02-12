"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../types/Logger");
class ConsoleLogger {
    log(level, component, operation, message, details) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${component}] [${operation}] ${message}`;
        if (details) {
            console.log(logEntry, details);
        }
        else {
            console.log(logEntry);
        }
    }
    info(component, operation, message, details) {
        this.log(Logger_1.LogLevel.INFO, component, operation, message, details);
    }
    warn(component, operation, message, details) {
        this.log(Logger_1.LogLevel.WARN, component, operation, message, details);
    }
    error(component, operation, message, details) {
        this.log(Logger_1.LogLevel.ERROR, component, operation, message, details);
    }
}
exports.default = ConsoleLogger;
