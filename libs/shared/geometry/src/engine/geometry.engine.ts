import { IExtendedGeometricForm, IGeometryEngine } from '../types';

export class GeometryEngine implements IGeometryEngine {
  private forms: Map<string, IExtendedGeometricForm> = new Map();

  constructor() {
    this.initializeBaseForms();
  }

  private initializeBaseForms() {
    const baseForms: Record<string, IExtendedGeometricForm> = {
      "icosahedron": { name: "Ikosaeder", faces: 20, description: "Wasser-Element" },
      "dodecahedron": { name: "Dodekaeder", faces: 12, description: "Äther-Element" },
      "torus": { name: "Torus", formula: "R-r", description: "Dynamik" }
    };

    Object.entries(baseForms).forEach(([key, value]) => {
      this.forms.set(key, value);
    });
  }

  public getForm(id: string): IExtendedGeometricForm | undefined {
    return this.forms.get(id);
  }

  public getAllForms(): IExtendedGeometricForm[] {
    return Array.from(this.forms.values());
  }
}
