import { getDatabase } from './connection';

export async function findUserByEmail(email: string) {
    return getDatabase()?.collection('users').findOne({ email });
}

export async function findUserByUsername(username: string) {
    return getDatabase()?.collection('users').findOne({ username });
}

export async function createUser(userData: any) {
    const result = await getDatabase()?.collection('users').insertOne({
        ...userData,
        createdAt: new Date()
    });
    return { id: result?.insertedId, ...userData };
}

// MongoDB braucht kein Tabellen-Setup
export async function setupUserTable() {
    console.log('Skipping SQL setup (MongoDB active)');
    return Promise.resolve();
}
