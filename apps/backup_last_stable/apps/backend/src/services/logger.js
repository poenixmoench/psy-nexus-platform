"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logDir = process.env.LOG_DIR || './logs';
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const logger = {
    info: (message, data) => {
        console.log(`ℹ️ ${message}`, data || '');
        fs_1.default.appendFileSync(path_1.default.join(logDir, 'combined.log'), JSON.stringify({ level: 'info', message, data, timestamp: new Date().toISOString() }) + '\n');
    },
    warn: (message, data) => {
        console.warn(`⚠️ ${message}`, data || '');
        fs_1.default.appendFileSync(path_1.default.join(logDir, 'combined.log'), JSON.stringify({ level: 'warn', message, data, timestamp: new Date().toISOString() }) + '\n');
    },
    error: (message, data) => {
        console.error(` [ERR]  ${message}`, data || '');
        fs_1.default.appendFileSync(path_1.default.join(logDir, 'error.log'), JSON.stringify({ level: 'error', message, data, timestamp: new Date().toISOString() }) + '\n');
    }
};
exports.default = logger;
