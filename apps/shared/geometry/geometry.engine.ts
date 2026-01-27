import { IGeometryEngine } from './types';
import { PLATONIC_SOLIDS } from './modules/platonic';
import { SACRED_GEOMETRY } from './modules/sacred';
import { COMPLEX_FORMS } from './modules/complex';

export const GEOMETRY_ENGINE: any = {
  PLATONIC_SOLIDS,
  SACRED_GEOMETRY,
  COMPLEX_FORMS,
  CALCULATORS: {
    getSpiral: (n: number) => { /* ... existing ... */ }
  }
};
