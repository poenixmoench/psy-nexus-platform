import { Server, Socket } from 'socket.io';
import { exec } from 'child_process';
import util from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';

const execPromise = util.promisify(exec);

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
  constructor(io: Server) { this.io = io; this.initializeSockets(); }

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

      // 2. SCHRITT: Von STAGING zu LIVE (Hauptseite)
      socket.on('publish-to-production', async () => {
        try {
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
          socket.emit('deployment-result', { success: false, error: error.message });
        }
      });
    });
  }
}

export default SocketHandler;
