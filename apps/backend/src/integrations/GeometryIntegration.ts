import { injectable, inject } from 'tsyringe';
import GeometryDatabaseService from '../services/GeometryDatabaseService';
import { Logger } from '../types/Logger';

@injectable()
export default class GeometryIntegration {
  constructor(
    @inject('Logger') private logger: Logger,
    private geometryService: GeometryDatabaseService
  ) {}

  async storeGeometry(geometry: any): Promise<string> {
    try {
      return await this.geometryService.save(geometry);
    } catch (error: any) {
      this.logger.error('GeometryIntegration', 'storeGeometry', error.message);
      throw error;
    }
  }

  async getGeometry(name: string): Promise<any> {
    try {
      return await this.geometryService.findByName(name);
    } catch (error: any) {
      this.logger.error('GeometryIntegration', 'getGeometry', error.message);
      throw error;
    }
  }

  async search(query: any, page: number = 1, limit: number = 10): Promise<any> {
    try {
      return await this.geometryService.search(query, page, limit);
    } catch (error: any) {
      this.logger.error('GeometryIntegration', 'search', error.message);
      throw error;
    }
  }

  async removeGeometry(id: string): Promise<boolean> {
    try {
      return await this.geometryService.delete(id);
    } catch (error: any) {
      this.logger.error('GeometryIntegration', 'removeGeometry', error.message);
      throw error;
    }
  }
}
