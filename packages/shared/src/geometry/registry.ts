export const GEOMETRY_CAPABILITIES = {
  VORTEX: {
    modes: ['RODIN_6', 'RODIN_9'],
    renderable: true,
    cacheable: true,
    complexity_weight: 0.4
  },
  MANDALA: {
    modes: ['SYMMETRIC_6', 'SYMMETRIC_12'],
    renderable: true,
    cacheable: true,
    complexity_weight: 0.7
  },
  DRAGON_CURVE: {
    modes: ['ITERATIVE'],
    renderable: true,
    cacheable: true,
    complexity_weight: 0.9
  },
  // === NEU: ADVANCED GEOMETRY ===
  OLOID: {
    modes: ['STANDARD'],
    renderable: true,
    cacheable: true,
    complexity_weight: 0.8
  },
  TORUS: {
    modes: ['PARAMETRIC_3D'],
    renderable: true,
    cacheable: true,
    complexity_weight: 0.6
  }
};

export type GeometryType = keyof typeof GEOMETRY_CAPABILITIES;
