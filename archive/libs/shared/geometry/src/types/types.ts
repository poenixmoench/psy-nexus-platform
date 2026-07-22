export interface IGeometryPoint { x: number; y: number; z?: number; }

export interface IGeometricForm {
  name: string;
  description: string;
  element?: string;
  faces?: number;
  vertices?: number;
  formula?: string;
  symbolism?: string;
  metadata?: {
    element?: string;
    symbolism?: string;
    phiRelation?: boolean;
    eulerRelation?: boolean;
  };
  calculatePoints?: (params: any) => IGeometryPoint[];
}

export interface IGeometryEngine {
  PLATONIC_SOLIDS: Record<string, IGeometricForm>;
  SACRED_GEOMETRY: Record<string, IGeometricForm>;
  COMPLEX_FORMS: Record<string, IGeometricForm>;
  CALCULATORS: Record<string, Function>;
}
