"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogMiddleware = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logDir = process.env.LOG_DIR || './logs';
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const auditLogMiddleware = (req, res, next) => {
    const start = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logEntry = {
            requestId,
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id || 'anonymous',
            ip: req.ip
        };
        const logLine = JSON.stringify(logEntry);
        fs_1.default.appendFileSync(path_1.default.join(logDir, 'audit.log'), logLine + '\n');
    });
    next();
};
exports.auditLogMiddleware = auditLogMiddleware;
