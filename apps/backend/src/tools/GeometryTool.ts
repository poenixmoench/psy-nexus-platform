import { injectable } from 'tsyringe';
import * as fs from 'fs';
import * as path from 'path';

@injectable()
export class GeometryTool {
  private registry = new Map<string, any>();
  public formCount = 0;
  public utilityCount = 0;

  constructor() {
    this.initializeRegistry();
  }

  private initializeRegistry() {
    const basePath = '/root/psy-nexus-platform/packages/shared/dist/geometry';
    
    const scanDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js')) {
          try {
            delete require.cache[require.resolve(fullPath)];
            const mod = require(fullPath);
            this.deepExtract(mod);
          } catch (e) {}
        }
      });
    };

    scanDirectory(basePath);
    console.log(`✅ [GEOMETRY_TOOL] Gott-Modus: ${this.formCount} Formeln & ${this.utilityCount} Utilities bereit.`);
  }

  private deepExtract(obj: any, depth = 0) {
    if (depth > 5 || !obj || typeof obj !== 'object') return;

    Object.entries(obj).forEach(([key, val]: [string, any]) => {
      if (!val || typeof val !== 'object') return;

      const hasCalc = typeof val.calculatePoints === 'function' || 
                      typeof val.calculate === 'function' || 
                      typeof val.generator === 'function';

      if (hasCalc) {
        const upperKey = key.toUpperCase();
        if (!this.registry.has(upperKey)) {
          this.registry.set(upperKey, val);
          // Heuristik zur Unterscheidung
          if (val.name || val.description || depth > 0) {
            this.formCount++;
          } else {
            this.utilityCount++;
          }
        }
      }
      
      if (depth < 2) {
        this.deepExtract(val, depth + 1);
      }
    });
  }

  public getManifest() {
    return [{
      category: 'ALL_GEOMETRY',
      forms: Array.from(this.registry.keys())
    }];
  }

  public calculate(formKey: string, sequence = 'DEFAULT', params: any = {}) {
    const formula = this.registry.get(formKey.toUpperCase());
    if (!formula) {
        console.warn(`⚠️ [GEOMETRY_TOOL] Formel nicht gefunden: ${formKey}`);
        return null;
    }

    const calcFn = formula.calculatePoints || formula.calculate || formula.generator;
    if (typeof calcFn !== 'function') return null;

    try {
      const radius = params.radius || params.size || 100;
      return calcFn(radius, 64);
    } catch (e) {
      return null;
    }
  }
}
