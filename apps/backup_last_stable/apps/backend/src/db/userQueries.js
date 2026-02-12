"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserByUsername = findUserByUsername;
exports.createUser = createUser;
exports.setupUserTable = setupUserTable;
const connection_1 = require("./connection");
async function findUserByEmail(email) {
    return (0, connection_1.getDatabase)()?.collection('users').findOne({ email });
}
async function findUserByUsername(username) {
    return (0, connection_1.getDatabase)()?.collection('users').findOne({ username });
}
async function createUser(userData) {
    const result = await (0, connection_1.getDatabase)()?.collection('users').insertOne({
        ...userData,
        createdAt: new Date()
    });
    return { id: result?.insertedId, ...userData };
}
// MongoDB braucht kein Tabellen-Setup
async function setupUserTable() {
    console.log('Skipping SQL setup (MongoDB active)');
    return Promise.resolve();
}
