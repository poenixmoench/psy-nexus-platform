"use strict";
// backend/src/services/eventService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvent = createEvent;
exports.getAllEvents = getAllEvents;
exports.getEventById = getEventById;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
// Importiere auch updateEvent und deleteEvent aus eventQueries.ts
const eventQueries_1 = require("../db/eventQueries");
// Wrapper-Funktionen, die z.B. Validierung oder andere Logik enthalten könnten
// Hier werden einfach die Funktionen aus der Datenbankschicht (db/eventQueries.ts) direkt exportiert
// Stelle sicher, dass die Funktionen in eventQueries.ts entsprechend definiert sind (async/await)
async function createEvent(title, date) {
    try {
        // Optional: Weitere Validierung hier
        const result = await (0, eventQueries_1.createEvent)({ title, date });
        return result;
    }
    catch (error) {
        console.error('Service Error creating event:', error);
        return null; // oder throw new Error(...)
    }
}
async function getAllEvents(sort = 'chronological') {
    try {
        const result = await (0, eventQueries_1.getEvents)();
        return result;
    }
    catch (error) {
        console.error('Service Error fetching events:', error);
        return null; // oder throw new Error(...)
    }
}
async function getEventById(id) {
    try {
        const result = await (0, eventQueries_1.getEventById)(id.toString());
        return result;
    }
    catch (error) {
        console.error('Service Error fetching event by ID:', error);
        return null; // oder throw new Error(...)
    }
}
// NEU: Exportiere updateEvent
async function updateEvent(id, title, date) {
    try {
        const result = await (0, eventQueries_1.updateEvent)(id.toString(), title);
        return result;
    }
    catch (error) {
        console.error('Service Error updating event:', error);
        return null; // oder throw new Error(...)
    }
}
// NEU: Exportiere deleteEvent
async function deleteEvent(id) {
    try {
        const result = await (0, eventQueries_1.deleteEvent)(id.toString());
        return result;
    }
    catch (error) {
        console.error('Service Error deleting event:', error);
        return null; // oder throw new Error(...)
    }
}
// Falls du weitere Funktionen wie z.B. updateEvent, deleteEvent etc. brauchst, füge sie hier hinzu
