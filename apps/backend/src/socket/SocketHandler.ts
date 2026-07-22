import { Server, Socket } from 'socket.io';
import { exec } from 'child_process';
import util from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PrismaClient } from '@prisma/client'; // ← NEU: Prisma-Import für Alpha-Lock

const execPromise = util.promisify(exec);
const prisma = new PrismaClient(); // ← NEU: Prisma-Instanz für DB-Zugriff

interface DeploymentResult {
  success: boolean;
  message: string;
  log?: string;
  warnings?: string | null;
  error?: string;
}

// KORRIGIERTE PFADE passend zur Nginx-Konfiguration
const DEPLOYMENT_PATHS = {
  sourceDir: '/root/psy-nexus-platform/apps/backend/storage/last_build',
  targetDir: '/var/www/psy-nexus.live/dev-workspace', // STAGING
  prodDir: '/var/www/html',                          // LIVE (Hauptseite)
};

async function validateDirectory(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath, fs.constants.F_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

class SocketHandler {
  private io: Server;
  
  constructor(io: Server) { 
    this.io = io; 
    this.initializeSockets(); 
  }

  private initializeSockets() {
    this.io.on('connection', (socket: Socket) => {
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
        } catch (error: any) {
          socket.emit('deployment-result', { success: false, error: error.message });
        }
      });

      // 2. SCHRITT: Von STAGING zu LIVE (Hauptseite) – MIT ALPHA-LOCK
      socket.on('publish-to-production', async () => {
        try {
          // 🔒 ALPHA-LOCK PRÜFUNG (NEU – VOR dem rsync!)
          // Prüft, ob Tags mit Status WAITING_FOR_ALPHA existieren
          const pendingLock = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) FROM stigmergy_tags 
            WHERE payload->'data'->>'status' = 'WAITING_FOR_ALPHA'
               OR payload->>'status' = 'WAITING_FOR_ALPHA'
          `;

          if (Number(pendingLock[0].count) > 0) {
            console.log(`[ALPHA-LOCK] 🛡️ Deployment blockiert – ${pendingLock[0].count} Tag(s) warten auf Freigabe`);
            socket.emit('deployment-result', { 
              success: false, 
              error: 'Alpha-Lock aktiv – Freigabe erforderlich' 
            });
            return; // Abbruch vor rsync!
          }

          // Bestehende Logik (unverändert)
          const { targetDir, prodDir } = DEPLOYMENT_PATHS;

          // Sicherheitscheck: Ist überhaupt was im Staging?
          const stagingContents = await fs.readdir(targetDir);
          if (stagingContents.length === 0) throw new Error("Staging ist leer!");

          // Kopiert den GEPRÜFTEN Stand auf die echte Hauptseite
          const command = `rsync -av --delete "${targetDir}/" "${prodDir}/"`;
          const { stdout } = await execPromise(command);

          socket.emit('deployment-result', {
            success: true,
            message: '🔥 LIVE! Die Hauptseite wurde aktualisiert.'
          });
        } catch (error: any) {
          console.error(`[DEPLOYMENT-ERROR]: ${error.message}`);
          socket.emit('deployment-result', { success: false, error: error.message });
        }
      });
    });
  }
}

export default SocketHandler;
