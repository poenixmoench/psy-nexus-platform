import { injectable, inject } from 'tsyringe';
import { Collection, ObjectId } from 'mongodb';
import { Logger } from '../types/Logger';
import { SacredGeometryPattern, SacredGeometryDocument } from '../types/GeometryTypes';

@injectable()
export default class GeometryDatabaseService {
  private collection!: Collection<any>;

  constructor(@inject('Logger') private logger: Logger) {}

  setCollection(collection: Collection<any>) {
    this.collection = collection;
  }

  async findByName(name: string): Promise<SacredGeometryDocument | null> {
    return this.collection.findOne({ name });
  }

  async save(geometry: SacredGeometryPattern): Promise<string> {
    const doc = { 
      ...geometry, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId.toString();
  }

  async search(query: any, page: number, limit: number) {
    const filter: any = {};
    if (query.name) filter.name = { $regex: query.name, $options: 'i' };
    if (query.dimensions) filter['properties.dimensions'] = query.dimensions;

    const items = await this.collection
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    const total = await this.collection.countDocuments(filter);
    return { items, total };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) as any });
    return result.deletedCount === 1;
  }
}
