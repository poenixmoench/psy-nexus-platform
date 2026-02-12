"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const fs = __importStar(require("fs/promises"));
const execPromise = util_1.default.promisify(child_process_1.exec);
// KORRIGIERTE PFADE passend zur Nginx-Konfiguration
const DEPLOYMENT_PATHS = {
    sourceDir: '/root/psy-nexus-platform/apps/backend/storage/last_build',
    targetDir: '/var/www/psy-nexus.live/dev-workspace', // STAGING
    prodDir: '/var/www/html', // LIVE (Hauptseite)
};
async function validateDirectory(dirPath) {
    try {
        await fs.access(dirPath, fs.constants.F_OK | fs.constants.W_OK);
        return true;
    }
    catch (err) {
        return false;
    }
}
class SocketHandler {
    constructor(io) { this.io = io; this.initializeSockets(); }
    initializeSockets() {
        this.io.on('connection', (socket) => {
            console.log(`Verbunden: ${socket.id}`);
            // 1. SCHRITT: Vom Agenten zum STAGING (/staging)
            socket.on('host-project', async () => {
                try {
                    const { sourceDir, targetDir } = DEPLOYMENT_PATHS;
                    await fs.mkdir(targetDir, { recursive: true });
                    // Kopiert das reine Agenten-Ergebnis ins Staging
                    const command = `rsync -av --delete "${sourceDir}/" "${targetDir}/"`;
                    await execPromise(command);
                    socket.emit('deployment-result', {
                        success: true,
                        message: 'Check auf: psy-nexus.live/staging'
                    });
                }
                catch (error) {
                    socket.emit('deployment-result', { success: false, error: error.message });
                }
            });
            // 2. SCHRITT: Von STAGING zu LIVE (Hauptseite)
            socket.on('publish-to-production', async () => {
                try {
                    const { targetDir, prodDir } = DEPLOYMENT_PATHS;
                    // Sicherheitscheck: Ist überhaupt was im Staging?
                    const stagingContents = await fs.readdir(targetDir);
                    if (stagingContents.length === 0)
                        throw new Error("Staging ist leer!");
                    // Kopiert den GEPRÜFTEN Stand auf die echte Hauptseite
                    const command = `rsync -av --delete "${targetDir}/" "${prodDir}/"`;
                    const { stdout } = await execPromise(command);
                    socket.emit('deployment-result', {
                        success: true,
                        message: '🔥 LIVE! Die Hauptseite wurde aktualisiert.'
                    });
                }
                catch (error) {
                    socket.emit('deployment-result', { success: false, error: error.message });
                }
            });
        });
    }
}
exports.default = SocketHandler;
