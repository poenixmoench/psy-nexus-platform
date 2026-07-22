import { IExtendedGeometricForm, IGeometryEngine, IGeometryPoint } from '../types';
import { SACRED_GEOMETRY } from '../modules/sacred';
import { PLATONIC_SOLIDS } from '../modules/platonic';
import { VORTEX_MATH } from '../modules/vortex';
import { COMPLEX_FORMS } from '../modules/complex';

export class GeometryEngine implements IGeometryEngine {
  private forms: Map<string, IExtendedGeometricForm> = new Map();

  constructor() {
    this.registerAll();
  }

  private registerAll() {
    Object.entries(SACRED_GEOMETRY).forEach(([k, v]) => this.forms.set(k.toLowerCase(), v));
    Object.entries(PLATONIC_SOLIDS).forEach(([k, v]) => this.forms.set(k.toLowerCase(), v));
    Object.entries(COMPLEX_FORMS).forEach(([k, v]) => this.forms.set(k.toLowerCase(), v));
    
    this.forms.set('vortex_rodin', {
      name: "Vortex Rodin",
      description: "Dynamisches Vektorfeld nach Marco Rodin",
      calculatePoints: (params) => VORTEX_MATH.calculateVortexPoints(params?.radius, params?.height)
    });
  }

  public getForm(id: string): IExtendedGeometricForm | undefined {
    return this.forms.get(id.toLowerCase());
  }

  public getAllForms(): IExtendedGeometricForm[] {
    return Array.from(this.forms.values());
  }

  public calculate(formId: string, params?: any): IGeometryPoint[] {
    const form = this.getForm(formId);
    return form?.calculatePoints ? form.calculatePoints(params) : [];
  }
}
