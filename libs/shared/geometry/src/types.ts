export interface IGeometryPoint {
  x: number;
  y: number;
  z?: number;
}

export interface IExtendedGeometricForm<T = any> {
  name: string;
  description: string;
  faces?: number;
  formula?: string;
  symbolism?: string;
  calculatePoints?: (...args: any[]) => IGeometryPoint[];
  metadata?: T;
}

export interface IGeometryEngine {
  // Methoden als optional markieren (?), damit das Objekt in index.ts nicht meckert
  getForm?(id: string): IExtendedGeometricForm | undefined;
  getAllForms?(): IExtendedGeometricForm[];
  [key: string]: any;
}
