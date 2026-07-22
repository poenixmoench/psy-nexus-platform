import { getDatabase } from './connection';
import { ObjectId } from 'mongodb';

export async function getEvents(): Promise<any> {
    return getDatabase()?.collection('events').find({}).toArray();
}

export async function createEvent(eventData: any): Promise<any> {
    return getDatabase()?.collection('events').insertOne({ ...eventData, createdAt: new Date() });
}

export async function getEventById(id: string): Promise<any> {
    return getDatabase()?.collection('events').findOne({ _id: new ObjectId(id) });
}

export async function updateEvent(id: string, data: any): Promise<any> {
    return getDatabase()?.collection('events').updateOne({ _id: new ObjectId(id) }, { $set: data });
}

export async function deleteEvent(id: string): Promise<any> {
    return getDatabase()?.collection('events').deleteOne({ _id: new ObjectId(id) });
}

export async function setupEventTable() {
    console.log('Skipping SQL setup (MongoDB active)');
    return Promise.resolve();
}
