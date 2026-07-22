export interface IGeometryPoint {
  x: number;
  y: number;
  z?: number;
}

export interface IExtendedGeometricForm {
  name: string;
  description: string;
  faces?: number;
  formula?: string;
  symbolism?: string;
  calculatePoints?: (params?: any) => IGeometryPoint[];
  metadata?: any;
}

export interface IGeometryEngine {
  getForm(id: string): IExtendedGeometricForm | undefined;
  getAllForms(): IExtendedGeometricForm[];
  calculate(formId: string, params?: any): IGeometryPoint[];
}
