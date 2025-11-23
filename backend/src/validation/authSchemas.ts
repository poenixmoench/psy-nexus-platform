import { z } from 'zod';

// Zod Schema für die Registrierung
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

// Zod Schema für den Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Exportiere die Schemas als Objekt, falls gewünscht
// export const authSchemas = {
//   registerSchema,
//   loginSchema,
// };
