export interface IExtendedGeometricForm<T = any> {
  name: string;
  description: string;
  faces?: number;      // Fehlte für Platonische Körper
  formula?: string;    // Fehlte für Fraktale/Spiralen
  metadata?: T;
}
