"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.getPool = getPool;
exports.closePool = closePool;
const pg_1 = require("pg");
const logger_1 = __importDefault(require("./logger"));
exports.pool = null;
function getPool() {
    if (!exports.pool) {
        const connectionString = process.env.DATABASE_URL || 'postgres://psy_user:password@db:5432/db_name';
        console.log('🔗 [DATABASE] Initializing pool with:', connectionString.replace(/password[^@]*@/, 'password:***@'));
        try {
            exports.pool = new pg_1.Pool({
                connectionString,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
            exports.pool.on('error', (err) => {
                console.error(' [ERR]  [POOL ERROR]', err.message);
                logger_1.default.error('Unexpected error on idle client', { error: err.message });
            });
            console.log(' [OK]  [DATABASE] Pool created successfully!');
        }
        catch (error) {
            console.error(' [ERR]  [DATABASE ERROR]', error);
            throw error;
        }
    }
    return exports.pool;
}
async function closePool() {
    if (exports.pool) {
        await exports.pool.end();
        exports.pool = null;
    }
}
