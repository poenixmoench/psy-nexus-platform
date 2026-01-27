export interface SacredGeometryPattern {
  name: string;
  description: string;
  category: string;
  tags: string[];
  properties: any;
  meta: any;
}
export interface SacredGeometryDocument extends SacredGeometryPattern {
  _id: string;
}
