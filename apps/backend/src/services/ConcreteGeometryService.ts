import { injectable, inject } from 'tsyringe';
import { GeometryService, GeometrySearchQuery, PaginatedResult } from '../types/GeometryService';
import { SacredGeometryDocument, SacredGeometryPattern } from '../types/GeometryTypes';
import { Logger } from '../types/Logger';
import GeometryDatabaseService from './GeometryDatabaseService';

@injectable()
export class ConcreteGeometryService implements GeometryService {
  constructor(
    @inject('Logger') private logger: Logger,
    private db: GeometryDatabaseService
  ) {}

  async loadGeometryByName(name: string): Promise<SacredGeometryDocument | null> {
    return this.db.findByName(name);
  }

  async storeGeometry(geometry: SacredGeometryPattern): Promise<string> {
    return this.db.save(geometry);
  }

  async searchGeometries(query: GeometrySearchQuery, page: number, limit: number): Promise<PaginatedResult<SacredGeometryDocument>> {
    this.logger.info('ConcreteGeometryService', 'search', `Suche: ${JSON.stringify(query)}`);
    const result = await this.db.search(query, page, limit);
    return {
      items: result.items,
      total: result.total,
      page,
      limit
    };
  }

  async deleteGeometry(id: string): Promise<boolean> {
    return this.db.delete(id);
  }
}
