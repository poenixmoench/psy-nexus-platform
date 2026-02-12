// KORRIGIERTE GEOMETRY.ENGINE.TS MIT BEHEBUNG DER METADATA-TYPOS
import { IGeometricForm, IGeometryPoint, IGeometryEngine } from "../types";
import { PLATONIC_SOLIDS } from "../modules/platonic";
import { SACRED_GEOMETRY } from "../modules/sacred";
import { COMPLEX_FORMS } from "../modules/complex";

// Optimierter geometrischer Punkt-Typ
type Vector3D = [number, number, number];

// Mathematische Konstanten
const MATHEMATICAL_CONSTANTS = {
  PHI: 1.618033988749895,
  PI: 3.141592653589793,
  SQRT3_DIV2: Math.sqrt(3) / 2, // Exakte Höhe für gleichseitige Dreiecke
  E: 2.718281828459045,
  EULER_IDENTITY: { formula: "e^(iπ) + 1 = 0", description: "Eulersche Identität" },
  EULER_CHARACTERISTIC: { formula: "V - E + F = 2", description: "Ecken - Kanten + Flächen" }
};

// Zentrale Cache-Klasse für wiederholte Berechnungen
class GeometryCache {
  private static instance: GeometryCache;
  private cache = new Map<string, IGeometryPoint[]>();

  static getInstance(): GeometryCache {
    if (!GeometryCache.instance) {
      GeometryCache.instance = new GeometryCache();
    }
    return GeometryCache.instance;
  }

  get(key: string): IGeometryPoint[] | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: IGeometryPoint[]): void {
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Optimierter Algorithmus für Ikosaeder (vor-berechnete Werte)
const PRECOMPUTED_ICOSAHEDRON_VERTICES = (size: number): Vector3D[] => {
  const phi = MATHEMATICAL_CONSTANTS.PHI;
  return [
    [0, size, phi*size], [0, -size, phi*size], [0, size, -phi*size], [0, -size, -phi*size],
    [size, phi*size, 0], [-size, phi*size, 0], [size, -phi*size, 0], [-size, -phi*size, 0],
    [phi*size, 0, size], [-phi*size, 0, size], [phi*size, 0, -size], [-phi*size, 0, -size]
  ] as Vector3D[];
};

// Optimierter Algorithmus für Dodekaeder (vor-berechnete Werte)
const PRECOMPUTED_DODECAHEDRON_VERTICES = (size: number): Vector3D[] => {
  const phi = MATHEMATICAL_CONSTANTS.PHI;
  return [
    [size, size, size], [size, size, -size], [size, -size, size], [size, -size, -size],
    [-size, size, size], [-size, size, -size], [-size, -size, size], [-size, -size, -size],
    [0, size/phi, phi*size], [0, -size/phi, phi*size], [0, size/phi, -phi*size], [0, -size/phi, -phi*size],
    [size/phi, phi*size, 0], [-size/phi, phi*size, 0], [size/phi, -phi*size, 0], [-size/phi, -phi*size, 0],
    [phi*size, 0, size/phi], [-phi*size, 0, size/phi], [phi*size, 0, -size/phi], [-phi*size, 0, -size/phi]
  ] as Vector3D[];
};

// Interface-Erweiterung
interface IExtendedGeometricForm<T = any> extends IGeometricForm {
  metadata?: {
    element?: string;
    symbolism?: string;
    phiRelation?: boolean;
    eulerRelation?: boolean;
  };
  cache?: Map<string, IGeometryPoint[]>; // Cache für häufige Berechnungen
}

const ADVANCED_SOLIDS: Record<string, IExtendedGeometricForm> = {
  ICOSAHEDRON: {
    name: "Ikosaeder",
    description: "20 Flächen (Dreiecke), Dual zum Dodekaeder",
    faces: 20,
    vertices: 12,
    formula: "V - E + F = 2",
    metadata: { element: "Luft", phiRelation: true },
    calculatePoints: (size: number = 1): IGeometryPoint[] => {
      const cacheKey = `icosahedron_${size}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const vertices = PRECOMPUTED_ICOSAHEDRON_VERTICES(size);
      const result = vertices.map(([x, y, z]) => ({ x, y, z }));
      GeometryCache.getInstance().set(cacheKey, result);
      return result;
    }
  },

  DODECAHEDRON: {
    name: "Dodekaeder",
    description: "12 Flächen (Fünfecke), Dual zum Ikosaeder",
    faces: 12,
    vertices: 20,
    formula: "V - E + F = 2",
    metadata: { element: "Äther", phiRelation: true },
    calculatePoints: (size: number = 1): IGeometryPoint[] => {
      const cacheKey = `dodecahedron_${size}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const vertices = PRECOMPUTED_DODECAHEDRON_VERTICES(size);
      const result = vertices.map(([x, y, z]) => ({ x, y, z }));
      GeometryCache.getInstance().set(cacheKey, result);
      return result;
    }
  },

  OLOID: {
    name: "Oloid",
    description: "Rollenkörper aus zwei Kreisen",
    formula: "Spezielle Rotationsgeometrie",
    calculatePoints: (length: number = 1): IGeometryPoint[] => {
      const cacheKey = `oloid_${length}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      const r = length / 2;
      const step = 0.1;

      // Erster Kreis in X-Y Ebene
      for(let a = 0; a < 2 * MATHEMATICAL_CONSTANTS.PI; a += step) {
        pts.push({ x: r * Math.cos(a), y: r * Math.sin(a), z: 0 });
      }
      // Zweiter Kreis in Y-Z Ebene (verschoben)
      for(let a = 0; a < 2 * MATHEMATICAL_CONSTANTS.PI; a += step) {
        pts.push({ x: 0, y: r * Math.cos(a), z: r * Math.sin(a) + r });
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    }
  },

  MOBIUS_STRIP: {
    name: "Möbiusband",
    description: "Einseitige Oberfläche",
    formula: "Topologisches Objekt mit 1 Rand",
    calculatePoints: (radius: number = 1, twists: number = 1): IGeometryPoint[] => {
      const cacheKey = `mobius_${radius}_${twists}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      const steps = 100;
      for(let i = 0; i < steps; i++) {
        const u = (i / steps) * 2 * MATHEMATICAL_CONSTANTS.PI;
        for(let v = -0.5; v <= 0.5; v += 0.1) {
          const x = (radius + v * Math.cos(twists * u / 2)) * Math.cos(u);
          const y = (radius + v * Math.cos(twists * u / 2)) * Math.sin(u);
          const z = v * Math.sin(twists * u / 2);
          pts.push({ x, y, z });
        }
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    }
  }
};

// Optimierter Spiral-Generator mit gemeinsamer Basis
const createSpiral = (type: 'log' | 'fib', params: { turns?: number; growth?: number; iterations?: number } = {}): IGeometryPoint[] => {
  const { turns = 1, growth = 0.1, iterations = 10 } = params;
  const cacheKey = `spiral_${type}_${turns}_${growth}_${iterations}`;
  const cached = GeometryCache.getInstance().get(cacheKey);
  if (cached) return cached;

  const pts: IGeometryPoint[] = [];

  if (type === 'log') {
    for(let i = 0; i < turns * 100; i++) {
      const theta = (i / 100) * 2 * MATHEMATICAL_CONSTANTS.PI;
      const r = Math.exp(growth * theta);
      pts.push({ x: r * Math.cos(theta), y: r * Math.sin(theta) });
    }
  } else if (type === 'fib') {
    let a = 0, b = 1;
    for(let i = 0; i < iterations; i++) {
      const next = a + b;
      pts.push({x: next * Math.cos(i), y: next * Math.sin(i)});
      a = b;
      b = next;
    }
  }

  GeometryCache.getInstance().set(cacheKey, pts);
  return pts;
};

const SPIRAL_FORMS: Record<string, IExtendedGeometricForm> = {
  LOG_SPIRAL: {
    name: "Logarithmische Spirale",
    description: "r = a * e^(bθ)",
    formula: "r = a * e^(bθ)",
    metadata: { phiRelation: true },
    calculatePoints: (turns: number = 1, growth: number = 0.1): IGeometryPoint[] => {
      return createSpiral('log', { turns, growth });
    }
  },

  FIB_SPIRAL: {
    name: "Fibonacci-Spirale",
    description: "Spirale basierend auf Fibonacci-Reihe",
    formula: "φⁿ / √5",
    metadata: { phiRelation: true },
    calculatePoints: (iterations: number = 10): IGeometryPoint[] => {
      return createSpiral('fib', { iterations });
    }
  }
};

// Korrigierter Sierpinski-Generator mit exakter Geometrie
const createSierpinski = (depth: number): IGeometryPoint[] => {
  const cacheKey = `sierpinski_${depth}`;
  const cached = GeometryCache.getInstance().get(cacheKey);
  if (cached) return cached;

  const pts: IGeometryPoint[] = [];
  const drawTriangle = (x: number, y: number, size: number, level: number) => {
    if(level === 0) {
      // Exakte Höhe für gleichseitiges Dreieck: sqrt(3)/2 * Seitenlänge
      const height = size * MATHEMATICAL_CONSTANTS.SQRT3_DIV2;
      pts.push({x, y}, {x: x+size, y}, {x: x+size/2, y: y+height});
    } else {
      const half = size/2;
      const height = half * MATHEMATICAL_CONSTANTS.SQRT3_DIV2;
      drawTriangle(x, y, half, level-1);           // Oberes Dreieck
      drawTriangle(x+half, y, half, level-1);     // Rechtes Dreieck
      drawTriangle(x+half/2, y+height, half, level-1); // Unteres Dreieck
    }
  };
  drawTriangle(0, 0, 100, depth);

  GeometryCache.getInstance().set(cacheKey, pts);
  return pts;
};

const FRACTAL_FORMS: Record<string, IExtendedGeometricForm> = {
  DRAGON_CURVE: {
    name: "Drachenkurve",
    description: "Fraktale Kurve durch Iteration",
    formula: "Iteratives Faltsystem",
    metadata: { phiRelation: true },
    calculatePoints: (iterations: number = 8): IGeometryPoint[] => {
      const cacheKey = `dragon_${iterations}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      let path = "R";
      for(let i = 0; i < iterations; i++) {
        const oldPath = path;
        path = oldPath + "R";
        for(let j = oldPath.length - 1; j >= 0; j--) {
          path += oldPath[j] === "R" ? "L" : "R";
        }
      }

      const pts: IGeometryPoint[] = [{x: 0, y: 0}];
      let x = 0, y = 0, dir = 0;
      const directions = [[1,0], [0,1], [-1,0], [0,-1]];
      for(const turn of path) {
        const [dx, dy] = directions[dir % 4];
        x += dx; y += dy;
        pts.push({x, y});
        dir += turn === "R" ? 1 : -1;
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    }
  },

  MANDELBROT_SET: {
    name: "Mandelbrot-Menge",
    description: "Fraktal basierend auf komplexer Zahlenebene",
    formula: "zₙ₊₁ = zₙ² + c",
    metadata: { eulerRelation: true },
    calculatePoints: (maxIterations: number = 100, zoom: number = 1): IGeometryPoint[] => {
      const cacheKey = `mandelbrot_${maxIterations}_${zoom}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      for(let x = -2; x < 1; x += 0.1/zoom) {
        for(let y = -1.5; y < 1.5; y += 0.1/zoom) {
          let zx = 0, zy = 0;
          let i = 0;
          while(zx*zx + zy*zy < 4 && i < maxIterations) {
            const tmp = zx*zx - zy*zy + x;
            zy = 2*zx*zy + y;
            zx = tmp;
            i++;
          }
          if(i === maxIterations) {
            pts.push({x, y});
          }
        }
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    }
  },

  SIERPINSKI_TRIANGLE: {
    name: "Sierpinski-Dreieck",
    description: "Selbstähnliches Fraktal",
    formula: "rekursive Teilung in 3 Dreiecke",
    metadata: { phiRelation: true },
    calculatePoints: (depth: number = 5): IGeometryPoint[] => {
      // Korrektur: Nutze exakte Geometrie statt PI/6
      return createSierpinski(depth);
    }
  }
};

const SACRED_EXTENDED: Record<string, IExtendedGeometricForm> = {
  SRI_YANTRA: {
    ...SACRED_GEOMETRY.SRI_YANTRA,
    metadata: { phiRelation: true },
    calculatePoints: (layers: number = 9): IGeometryPoint[] => {
      const cacheKey = `sriyantra_${layers}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      for(let i = 0; i < layers; i++) {
        const angleOffset = (i * MATHEMATICAL_CONSTANTS.PI) / layers;
        for(let j = 0; j < 3; j++) {
          const angle = (j * 2 * MATHEMATICAL_CONSTANTS.PI) / 3 + angleOffset;
          const radius = 1 - (i * 0.1);
          pts.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
          });
        }
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    }
  }
};

export const GEOMETRY_ENGINE: IGeometryEngine = {
  PLATONIC_SOLIDS: {...PLATONIC_SOLIDS, ...ADVANCED_SOLIDS},
  SACRED_GEOMETRY: {
    ...SACRED_GEOMETRY,
    ...SACRED_EXTENDED,
    VESICA_PISCIS: {
      name: "Vesica Piscis",
      description: "Schnittmenge zweier Kreise",
      symbolism: "Ursprung der Schöpfung",
      formula: "R = r * sqrt(3)",
      metadata: { phiRelation: true },
      calculatePoints: (radius: number = 1, distance: number = radius): IGeometryPoint[] => {
        const cacheKey = `vesicapiscis_${radius}_${distance}`;
        const cached = GeometryCache.getInstance().get(cacheKey);
        if (cached) return cached;

        const pts: IGeometryPoint[] = [];
        const step = 0.1;
        for(let a = 0; a < 2 * MATHEMATICAL_CONSTANTS.PI; a += step) {
          pts.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) });
        }
        for(let a = 0; a < 2 * MATHEMATICAL_CONSTANTS.PI; a += step) {
          pts.push({ x: distance + radius * Math.cos(a), y: radius * Math.sin(a) });
        }

        GeometryCache.getInstance().set(cacheKey, pts);
        return pts;
      }
    },
    FLOWER_OF_LIFE: {
      name: "Blume des Lebens",
      description: "Muster aus überlappenden Kreisen",
      symbolism: "Heiliges geometrisches Muster",
      metadata: { phiRelation: true },
      calculatePoints: (layers: number = 3, radius: number = 1): IGeometryPoint[] => {
        const cacheKey = `floweroflife_${layers}_${radius}`;
        const cached = GeometryCache.getInstance().get(cacheKey);
        if (cached) return cached;

        const pts: IGeometryPoint[] = [];
        for(let ring = 0; ring < layers; ring++) {
          const circumference = 2 * MATHEMATICAL_CONSTANTS.PI * ring * radius;
          const count = Math.max(6, Math.floor(circumference / radius));
          for(let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * MATHEMATICAL_CONSTANTS.PI;
            const x = ring * radius * Math.cos(angle);
            const y = ring * radius * Math.sin(angle);
            for(let a = 0; a < 2 * MATHEMATICAL_CONSTANTS.PI; a += 0.2) {
              pts.push({
                x: x + radius * Math.cos(a),
                y: y + radius * Math.sin(a)
              });
            }
          }
        }

        GeometryCache.getInstance().set(cacheKey, pts);
        return pts;
      }
    }
  },
  COMPLEX_FORMS: {
    ...COMPLEX_FORMS,
    ...SPIRAL_FORMS,
    ...FRACTAL_FORMS,
    TORUS: {
      ...COMPLEX_FORMS.TORUS,
      metadata: { phiRelation: true }
    }
  },
  CALCULATORS: {
    // Optimierte Basisfunktionen mit Caching
    calculateTetrahedron: (size: number = 1) => {
      const cacheKey = `tetrahedron_${size}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const result = PLATONIC_SOLIDS.TETRAHEDRON.calculatePoints!(size);
      GeometryCache.getInstance().set(cacheKey, result);
      return result;
    },

    calculateTorus: (R: number = 2, r: number = 0.5) => {
      const cacheKey = `torus_${R}_${r}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const result = COMPLEX_FORMS.TORUS.calculatePoints!(R);
      GeometryCache.getInstance().set(cacheKey, result);
      return result;
    },

    calculateSpiral: (turns: number = 1, points: number = 100): IGeometryPoint[] => {
      const cacheKey = `generic_spiral_${turns}_${points}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      for(let i = 0; i < points; i++) {
        const angle = (i / points) * turns * 2 * MATHEMATICAL_CONSTANTS.PI;
        const radius = angle / (2 * MATHEMATICAL_CONSTANTS.PI);
        pts.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    },

    calculateGoldenRatioRect: (width: number = 1): IGeometryPoint[] => {
      const cacheKey = `goldenrect_${width}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const height = width / MATHEMATICAL_CONSTANTS.PHI;
      const result = [
        { x: 0, y: 0 }, { x: width, y: 0 },
        { x: width, y: height }, { x: 0, y: height }
      ];

      GeometryCache.getInstance().set(cacheKey, result);
      return result;
    },

    calculateMetatronsCube: (radius: number = 1): IGeometryPoint[] => {
      const cacheKey = `metatron_${radius}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      for(let x = -1; x <= 1; x += 2)
        for(let y = -1; y <= 1; y += 2)
          for(let z = -1; z <= 1; z += 2)
            pts.push({ x: x * radius, y: y * radius, z: z * radius });

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    },

    // Neue optimierte Funktionen
    calculateBezierCurve: (start: IGeometryPoint, control: IGeometryPoint, end: IGeometryPoint, steps: number = 100): IGeometryPoint[] => {
      const cacheKey = `bezier_${start.x}_${start.y}_${control.x}_${control.y}_${end.x}_${end.y}_${steps}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      for(let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.pow(1-t, 2)*start.x + 2*(1-t)*t*control.x + t*t*end.x;
        const y = Math.pow(1-t, 2)*start.y + 2*(1-t)*t*control.y + t*t*end.y;
        pts.push({x, y});
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    },

    calculateLinearInterpolation: (start: IGeometryPoint, end: IGeometryPoint, steps: number = 100): IGeometryPoint[] => {
      const cacheKey = `lerp_${start.x}_${start.y}_${end.x}_${end.y}_${steps}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      for(let i = 0; i <= steps; i++) {
        const t = i / steps;
        pts.push({
          x: start.x + t * (end.x - start.x),
          y: start.y + t * (end.y - start.y)
        });
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    },

    calculateMandalaSymmetry: (baseShape: IGeometryPoint[], repetitions: number = 8): IGeometryPoint[] => {
      const cacheKey = `mandala_${baseShape.length}_${repetitions}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      const angleStep = (2 * MATHEMATICAL_CONSTANTS.PI) / repetitions;
      for(let i = 0; i < repetitions; i++) {
        const rotationAngle = i * angleStep;
        for(const point of baseShape) {
          const x = point.x * Math.cos(rotationAngle) - point.y * Math.sin(rotationAngle);
          const y = point.x * Math.sin(rotationAngle) + point.y * Math.cos(rotationAngle);
          pts.push({x, y});
        }
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    },

    calculateSriYantra: (layers: number = 9): IGeometryPoint[] => {
      const cacheKey = `sriyantra_calc_${layers}`;
      const cached = GeometryCache.getInstance().get(cacheKey);
      if (cached) return cached;

      const pts: IGeometryPoint[] = [];
      for(let i = 0; i < layers; i++) {
        const angleOffset = (i * MATHEMATICAL_CONSTANTS.PI) / layers;
        for(let j = 0; j < 3; j++) {
          const angle = (j * 2 * MATHEMATICAL_CONSTANTS.PI) / 3 + angleOffset;
          const radius = 1 - (i * 0.1);
          pts.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
          });
        }
      }

      GeometryCache.getInstance().set(cacheKey, pts);
      return pts;
    },

    // Neue Performance-Funktionen
    compressPoints: (points: IGeometryPoint[], tolerance: number = 0.1): IGeometryPoint[] => {
      // Ramer-Douglas-Peucker Algorithmus für Punkt-Kompression
      if (points.length <= 2) return points;

      const first = points[0];
      const last = points[points.length - 1];
      let maxDist = 0;
      let maxIndex = 0;

      for (let i = 1; i < points.length - 1; i++) {
        const dist = Math.abs(
          (last.y - first.y) * points[i].x - 
          (last.x - first.x) * points[i].y + 
          last.x * first.y - last.y * first.x
        ) / Math.sqrt(Math.pow(last.y - first.y, 2) + Math.pow(last.x - first.x, 2));

        if (dist > maxDist) {
          maxDist = dist;
          maxIndex = i;
        }
      }

      if (maxDist > tolerance) {
        const left = points.slice(0, maxIndex + 1);
        const right = points.slice(maxIndex);
        const leftPart = GEOMETRY_ENGINE.CALCULATORS.compressPoints(left, tolerance);
        const rightPart = GEOMETRY_ENGINE.CALCULATORS.compressPoints(right, tolerance);
        return [...leftPart.slice(0, -1), ...rightPart];
      } else {
        return [first, last];
      }
    },

    normalizePoints: (points: IGeometryPoint[]): IGeometryPoint[] => {
      if (points.length === 0) return points;

      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const rangeX = maxX - minX, rangeY = maxY - minY;
      const scale = Math.max(rangeX, rangeY);

      return points.map(p => ({
        x: (p.x - minX) / scale,
        y: (p.y - minY) / scale
      }));
    }
  }
};
