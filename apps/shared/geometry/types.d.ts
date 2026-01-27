export interface IGeometryPoint {
    x: number;
    y: number;
    z?: number;
}
export interface IGeometricForm {
    name: string;
    description: string;
    element?: string;
    faces?: number;
    vertices?: number;
    formula?: string;
    symbolism?: string;
    calculatePoints?: (params: any) => IGeometryPoint[];
}
export interface IGeometryEngine {
    PLATONIC_SOLIDS: Record<string, IGeometricForm>;
    SACRED_GEOMETRY: Record<string, IGeometricForm>;
    CALCULATORS: Record<string, Function>;
}
//# sourceMappingURL=types.d.ts.map