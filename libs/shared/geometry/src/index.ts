import { IGeometryEngine } from './types';
import { PLATONIC_SOLIDS } from './modules/platonic';
import { SACRED_GEOMETRY } from './modules/sacred';
import { COMPLEX_FORMS } from './modules/complex';
import { GEOMETRY_CALCULATORS } from './modules/calculators';
import { VORTEX_MATH } from './modules/vortex';

export * from './types';
export * from './utils';

export const GEOMETRY_ENGINE: IGeometryEngine = {
  PLATONIC_SOLIDS: {
    ...PLATONIC_SOLIDS
  },
  SACRED_GEOMETRY: {
    ...SACRED_GEOMETRY
  },
  COMPLEX_FORMS: {
    ...COMPLEX_FORMS,
    VORTEX: {
      name: "Vortex Geometry", description: "Wirbel-Dynamik basierend auf Rodin-Mathematik",
      calculatePoints: VORTEX_MATH.calculateVortexPoints
    }
  },
  CALCULATORS: {
    ...GEOMETRY_CALCULATORS,
    calculateVortex: VORTEX_MATH.calculateVortexPoints,
    calculateSriYantra: SACRED_GEOMETRY.SRI_YANTRA.calculatePoints
  }
};
