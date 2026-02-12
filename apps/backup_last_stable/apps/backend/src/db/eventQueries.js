"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = getEvents;
exports.createEvent = createEvent;
exports.getEventById = getEventById;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.setupEventTable = setupEventTable;
const connection_1 = require("./connection");
const mongodb_1 = require("mongodb");
async function getEvents() {
    return (0, connection_1.getDatabase)()?.collection('events').find({}).toArray();
}
async function createEvent(eventData) {
    return (0, connection_1.getDatabase)()?.collection('events').insertOne({ ...eventData, createdAt: new Date() });
}
async function getEventById(id) {
    return (0, connection_1.getDatabase)()?.collection('events').findOne({ _id: new mongodb_1.ObjectId(id) });
}
async function updateEvent(id, data) {
    return (0, connection_1.getDatabase)()?.collection('events').updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: data });
}
async function deleteEvent(id) {
    return (0, connection_1.getDatabase)()?.collection('events').deleteOne({ _id: new mongodb_1.ObjectId(id) });
}
async function setupEventTable() {
    console.log('Skipping SQL setup (MongoDB active)');
    return Promise.resolve();
}
