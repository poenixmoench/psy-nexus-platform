import { IGeometricForm } from '../types';

export const SACRED_GEOMETRY: Record<string, IGeometricForm> = {
  SRI_YANTRA: {
    name: "Sri Yantra",
    description: "Zentrales Diagramm der Tantra-Tradition",
    symbolism: "9 ineinandergreifende Dreiecke, kosmisches Zentrum",
    formula: "9 interlocking triangles forming 43 smaller triangles"
  },
  MERKABA: {
    name: "Merkaba",
    description: "Stern-Tetraeder",
    symbolism: "Licht-Geist-Körper Fahrzeug",
    vertices: 8,
    formula: "Two interlocking tetrahedrons"
  },
  VESICA_PISCIS: {
    name: "Vesica Piscis",
    description: "Schnittmenge zweier Kreise",
    symbolism: "Ursprung der Schöpfung",
    formula: "R = r * sqrt(3)"
  }
};
