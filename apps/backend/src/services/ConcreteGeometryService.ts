import { injectable, inject } from 'tsyringe';
import { PrismaService } from '../db/PrismaService';
import { Logger } from '../types/Logger';

@injectable()
export class ConcreteGeometryService {
  constructor(
    @inject(PrismaService) private prisma: PrismaService,
    @inject('Logger') private logger: Logger
  ) {}

  /**
   * Holt eine berechnete Geometrie aus der DB.
   * Nutzt den Compound-Index für maximale Geschwindigkeit.
   */
  async getCachedShape(shapeId: string, version: string, paramsHash: string) {
    try {
      return await (this.prisma as any).geometry_cache.findUnique({
        where: {
          shape_id_params_hash_version: {
            shape_id: shapeId,
            params_hash: paramsHash,
            version: version
          }
        }
      });
    } catch (error) {
      this.logger.error('ConcreteGeometryService', 'Cache-Read Error', error);
      return null;
    }
  }

  /**
   * Speichert das Ergebnis (Vektoren/Punkte) im Cache.
   * Aktualisiert den Zeitstempel bei Zugriff.
   */
  async saveToCache(shapeId: string, version: string, paramsHash: string, data: any) {
    try {
      return await (this.prisma as any).geometry_cache.upsert({
        where: {
          shape_id_params_hash_version: {
            shape_id: shapeId,
            params_hash: paramsHash,
            version: version
          }
        },
        update: {
          data: data,
          last_accessed: new Date()
        },
        create: {
          shape_id: shapeId,
          version: version,
          params_hash: paramsHash,
          data: data
        }
      });
    } catch (error) {
      this.logger.error('ConcreteGeometryService', 'Cache-Write Error', error);
    }
  }
}
