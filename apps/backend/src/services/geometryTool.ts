import { injectable, singleton } from 'tsyringe';
import { IGeometryEngine } from "@shared/types/AgentTypes";
import { GEOMETRY_CAPABILITIES } from "@shared/geometry";
import { GEOMETRY_CONSTANTS } from "@shared/geometry";

@singleton()
@injectable()
export class GeometryEngine implements IGeometryEngine {
  public readonly PLATONIC_SOLIDS = {};
  private readonly capabilities = GEOMETRY_CAPABILITIES;

  constructor() {
    console.log('📐 [GEOMETRY-ENGINE] Bridge-Mode aktiv. Registry synchronisiert.');
  }

  public getForm(id: string): any {
    const key = id.toUpperCase();
    return (this.capabilities as any)[key] || null;
  }

  public getAllForms(): any[] {
    return Object.entries(this.capabilities).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  public validateCapability(type: string): boolean {
    return !!(this.capabilities as any)[type.toUpperCase()];
  }
}
