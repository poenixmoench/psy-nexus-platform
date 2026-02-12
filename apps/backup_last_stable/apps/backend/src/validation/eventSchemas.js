"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
// Zod Schema für die Erstellung eines Events
exports.createEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, { message: "Title is required" }).max(255),
    date: zod_1.z.string().datetime({ message: "Date must be a valid ISO 8601 datetime string" }), // oder z.string().refine(d => !isNaN(Date.parse(d)), { message: "Invalid date format" })
});
// Zod Schema für die Aktualisierung eines Events (Felder optional)
exports.updateEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, { message: "Title must not be empty" }).max(255).optional(),
    date: zod_1.z.string().datetime({ message: "Date must be a valid ISO 8601 datetime string" }).optional(), // oder z.string().refine(d => !isNaN(Date.parse(d)), { message: "Invalid date format" }).optional()
});
// Zod Schema für die Registrierung (zur Erinnerung, falls du es später nutzt)
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
// Zod Schema für den Login (zur Erinnerung, falls du es später nutzt)
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
