import { IGeometricForm, IGeometryPoint } from '../types';

export const PLATONIC_SOLIDS: Record<string, IGeometricForm> = {
  TETRAHEDRON: {
    name: "Tetraeder",
    description: "4 Flächen, 4 Ecken",
    element: "Feuer",
    faces: 4,
    vertices: 4,
    formula: "V - E + F = 2",
    calculatePoints: (size: number = 1): IGeometryPoint[] => [
      {x: size, y: size, z: size}, {x: -size, y: -size, z: size},
      {x: -size, y: size, z: -size}, {x: size, y: -size, z: -size}
    ]
  },
  HEXAHEDRON: {
    name: "Hexaeder",
    description: "6 Flächen (Würfel)",
    element: "Erde",
    faces: 6,
    vertices: 8,
    formula: "a³"
  }
};
