import { z } from 'zod';

// Zod Schema für die Erstellung eines Events
export const createEventSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(255),
  date: z.string().datetime({ message: "Date must be a valid ISO 8601 datetime string" }), // oder z.string().refine(d => !isNaN(Date.parse(d)), { message: "Invalid date format" })
});

// Zod Schema für die Aktualisierung eines Events (Felder optional)
export const updateEventSchema = z.object({
  title: z.string().min(1, { message: "Title must not be empty" }).max(255).optional(),
  date: z.string().datetime({ message: "Date must be a valid ISO 8601 datetime string" }).optional(), // oder z.string().refine(d => !isNaN(Date.parse(d)), { message: "Invalid date format" }).optional()
});

// Zod Schema für die Registrierung (zur Erinnerung, falls du es später nutzt)
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

// Zod Schema für den Login (zur Erinnerung, falls du es später nutzt)
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
