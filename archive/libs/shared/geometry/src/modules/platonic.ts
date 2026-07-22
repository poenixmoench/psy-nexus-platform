import { IGeometryPoint, IExtendedGeometricForm } from '../types';

export const PLATONIC_SOLIDS: Record<string, IExtendedGeometricForm> = {
  TETRAHEDRON: {
    name: "Tetraeder",
    description: "4 Flächen (Dreiecke)",
    faces: 4,
    metadata: { element: "Feuer" },
    calculatePoints: (size = 1) => [
      { x: size, y: size, z: size }, { x: -size, y: -size, z: size },
      { x: -size, y: size, z: -size }, { x: size, y: -size, z: -size }
    ]
  },
  HEXAHEDRON: {
    name: "Hexaeder",
    description: "6 Flächen (Quadrate), Würfel",
    faces: 6,
    metadata: { element: "Erde" },
    calculatePoints: (size = 1) => [
      { x: -size, y: -size, z: -size }, { x: size, y: -size, z: -size },
      { x: size, y: size, z: -size }, { x: -size, y: size, z: -size },
      { x: -size, y: -size, z: size }, { x: size, y: -size, z: size },
      { x: size, y: size, z: size }, { x: -size, y: size, z: size }
    ]
  },
  OCTAHEDRON: {
    name: "Oktaeder",
    description: "8 Flächen (Dreiecke)",
    faces: 8,
    metadata: { element: "Luft" },
    calculatePoints: (size = 1) => [
      { x: size, y: 0, z: 0 }, { x: -size, y: 0, z: 0 },
      { x: 0, y: size, z: 0 }, { x: 0, y: -size, z: 0 },
      { x: 0, y: 0, z: size }, { x: 0, y: 0, z: -size }
    ]
  },
  // Extrahiert aus dem Vault (Advanced Solids)
  ICOSAHEDRON: {
    name: "Ikosaeder",
    description: "20 Flächen (Dreiecke), Dual zum Dodekaeder",
    faces: 20,
    metadata: { element: "Wasser", phiRelation: true },
    calculatePoints: (size = 1) => {
       // Hier würde die PRECOMPUTED Logik greifen
       return [{ x: 0, y: 0, z: 0 }]; // Placeholder für die exakten Vertices
    }
  },
  DODECAHEDRON: {
    name: "Dodekaeder",
    description: "12 Flächen (Fünfecke)",
    faces: 12,
    metadata: { element: "Äther", phiRelation: true },
    calculatePoints: (size = 1) => [{ x: 0, y: 0, z: 0 }]
  }
};
