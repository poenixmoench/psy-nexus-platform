import { SacredGeometryPattern, SacredGeometryDocument } from './GeometryTypes';

export interface GeometrySearchQuery extends Partial<SacredGeometryPattern> {
  dimensions?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type GeometryUpdateData = Partial<SacredGeometryPattern>;

export interface GeometryService {
  loadGeometryByName(name: string): Promise<SacredGeometryDocument | null>;
  storeGeometry(geometry: SacredGeometryPattern): Promise<string>;
  searchGeometries(query: GeometrySearchQuery, page: number, limit: number): Promise<PaginatedResult<SacredGeometryDocument>>;
  deleteGeometry(id: string): Promise<boolean>;
}
