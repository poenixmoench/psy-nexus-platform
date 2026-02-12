"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedItems = getPublishedItems;
exports.publishCode = publishCode;
exports.getPublishedItemById = getPublishedItemById;
exports.searchPublishedItems = searchPublishedItems;
const connection_1 = require("../connection");
const mongodb_1 = require("mongodb");
const COLLECTION = 'published_items';
async function getPublishedItems(limit = 10, skip = 0) {
    const db = (0, connection_1.getDatabase)();
    if (!db)
        throw new Error("Database not initialized");
    return db.collection(COLLECTION)
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();
}
async function publishCode(data) {
    const db = (0, connection_1.getDatabase)();
    const result = await db?.collection(COLLECTION).insertOne({
        ...data,
        createdAt: new Date()
    });
    return result?.insertedId.toString() || "";
}
async function getPublishedItemById(id) {
    const db = (0, connection_1.getDatabase)();
    return db?.collection(COLLECTION).findOne({ _id: new mongodb_1.ObjectId(id) }) || null;
}
async function searchPublishedItems(query) {
    const db = (0, connection_1.getDatabase)();
    return db?.collection(COLLECTION)
        .find({ $text: { $search: query } })
        .toArray() || [];
}
