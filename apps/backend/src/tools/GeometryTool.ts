import { injectable, inject } from 'tsyringe';
import { GEOMETRY_ENGINE } from '@shared/geometry';
import { IGeometryPoint } from '@shared/geometry';

type GeometryCategory = keyof typeof GEOMETRY_ENGINE;
type GeometryFormKey<T extends GeometryCategory> = keyof (typeof GEOMETRY_ENGINE)[T];

class GeometryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeometryNotFoundError';
  }
}

interface CalculateParams {
  size?: number;
  [key: string]: any;
}

@injectable()
export class GeometryTool {
  constructor(
    @inject('Logger') private logger: any
  ) {}

  public calculate<T extends GeometryCategory>(
    category: T,
    formKey: GeometryFormKey<T>,
    params: CalculateParams = {}
  ): IGeometryPoint[] {
    const size = params.size ?? 1;
    const logParams = { category, formKey, params };

    try {
      this.logger.info('GeometryTool', `Berechne ${String(formKey)} in ${String(category)}`, logParams);

      const categoryData = GEOMETRY_ENGINE[category];
      if (!categoryData) {
        throw new GeometryNotFoundError(`Kategorie '${String(category)}' nicht gefunden.`);
      }

      const formData = (categoryData as any)[formKey];
      if (!formData) {
        throw new GeometryNotFoundError(`Geometrie '${String(formKey)}' in '${String(category)}' nicht gefunden.`);
      }

      if (typeof formData.calculatePoints !== 'function') {
         this.logger.warn('GeometryTool', `Form '${String(formKey)}' hat keine calculatePoints-Funktion.`, logParams);
         return [];
      }

      return formData.calculatePoints(size);

    } catch (error: any) {
      this.logger.error('GeometryTool', error.message, logParams);
      return [];
    }
  }

  public getManifest(): { category: string; forms: string[] }[] {
    return Object.entries(GEOMETRY_ENGINE).map(([category, forms]) => ({
      category,
      forms: Object.keys(forms as object),
    }));
  }
}
