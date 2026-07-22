import { IGeometryPoint } from './types';

export const MATHEMATICAL_CONSTANTS = {
  PHI: 1.618033988749895,
  PI: 3.141592653589793,
  SQRT3_DIV2: Math.sqrt(3) / 2,
  E: 2.718281828459045,
  MAX_ITERATION_DEPTH: 15
};

export class GeometryCache {
  private static instance: GeometryCache;
  private cache = new Map<string, IGeometryPoint[]>();
  static getInstance(): GeometryCache {
    if (!GeometryCache.instance) GeometryCache.instance = new GeometryCache();
    return GeometryCache.instance;
  }
  get(key: string): IGeometryPoint[] | undefined { return this.cache.get(key); }
  set(key: string, value: IGeometryPoint[]): void { this.cache.set(key, value); }
  clear(): void { this.cache.clear(); }
}

export const GEOMETRY_UTILS = {
  // Punkte auf eine Box von -1 bis 1 normalisieren
  normalize: (points: IGeometryPoint[]): IGeometryPoint[] => {
    const xs = points.map(p => p.x), ys = points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.max(maxX - minX, maxY - minY);
    return points.map(p => ({
      x: (p.x - minX) / scale * 2 - 1,
      y: (p.y - minY) / scale * 2 - 1,
      z: p.z ? p.z / scale * 2 - 1 : 0
    }));
  },
  // Der Mandala-Generator: Rotiert eine Form n-mal
  // Erzeugt Dreiecke, Vierecke, Sechsecke etc.
  generatePolygon: (sides: number, radius: number = 1): IGeometryPoint[] => {
    const pts: IGeometryPoint[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * 2 * Math.PI;
      pts.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 0 });
    }
    return pts;
  },
  createMandala: (baseShape: IGeometryPoint[], repetitions: number = 6): IGeometryPoint[] => {
    const pts: IGeometryPoint[] = [];
    for (let i = 0; i < repetitions; i++) {
      const angle = (i * 2 * MATHEMATICAL_CONSTANTS.PI) / repetitions;
      baseShape.forEach(p => {
        pts.push({
          x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
          y: p.x * Math.sin(angle) + p.y * Math.cos(angle),
          z: p.z || 0
        });
      });
    }
    return pts;
  }
};
