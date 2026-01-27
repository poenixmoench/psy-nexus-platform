import { getDatabase } from '../connection';
import { ObjectId } from 'mongodb';

const COLLECTION = 'published_items';

export interface PublishedItem {
    _id?: ObjectId;
    title: string;
    content: any;
    createdAt: Date;
}

export async function getPublishedItems(limit = 10, skip = 0): Promise<PublishedItem[]> {
    const db = getDatabase();
    if (!db) throw new Error("Database not initialized");
    return db.collection<PublishedItem>(COLLECTION)
             .find({})
             .skip(skip)
             .limit(limit)
             .toArray();
}

export async function publishCode(data: any): Promise<string> {
    const db = getDatabase();
    const result = await db?.collection(COLLECTION).insertOne({
        ...data,
        createdAt: new Date()
    });
    return result?.insertedId.toString() || "";
}

export async function getPublishedItemById(id: string): Promise<PublishedItem | null> {
    const db = getDatabase();
    return db?.collection<PublishedItem>(COLLECTION).findOne({ _id: new ObjectId(id) }) || null;
}

export async function searchPublishedItems(query: string): Promise<PublishedItem[]> {
    const db = getDatabase();
    return db?.collection<PublishedItem>(COLLECTION)
             .find({ $text: { $search: query } })
             .toArray() || [];
}
