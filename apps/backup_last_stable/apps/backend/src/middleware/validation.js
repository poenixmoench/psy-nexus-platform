"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
// Generische Middleware-Funktion für Zod-Validierung
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Versuche, den Request-Body gegen das Schema zu validieren
            const validatedData = await schema.parseAsync(req.body);
            // Wenn erfolgreich, überschreibe req.body mit den validierten/gereinigten Daten
            req.body = validatedData;
            next(); // Gehe zur nächsten Middleware/Route
        }
        catch (error) {
            // Wenn die Validierung fehlschlägt, ist 'error' wahrscheinlich ein ZodError
            if (error instanceof Error) {
                if (error.name === 'ZodError') {
                    // @ts-ignore - TypeScript kennt das 'issues'-Feld von ZodError nicht direkt auf 'Error'
                    const issues = error.issues;
                    // Korrigiert: Typisierung für 'issue' hinzugefügt
                    return res.status(400).json({
                        error: 'Validation failed',
                        details: issues.map((issue) => ({
                            field: issue.path.join('.'),
                            message: issue.message,
                            value: issue.input,
                        })),
                    });
                }
                // Falls es ein anderer Fehler ist
                return res.status(500).json({ error: 'Internal Server Error during validation' });
            }
            // Falls 'error' kein Error-Objekt ist (ungewöhnlich, aber sicher ist sicher)
            return res.status(500).json({ error: 'Unknown error during validation' });
        }
    };
};
exports.validate = validate;
