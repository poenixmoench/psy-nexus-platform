// Einfache In-Memory Map für Demozwecke
const requestCounts = new Map();
const MAX_REQUESTS_PER_MINUTE = 15;
const WINDOW_MS = 60000; // 1 Minute
/**
 * Express Middleware zur Begrenzung der Anfragen pro IP-Adresse.
 * Schützt die Agenten-Endpunkte vor Überlastung.
 */
export const agentRateLimiter = (req, res, next) => {
    // Wenn Sie hinter einem Reverse Proxy sind, verwenden Sie req.headers['x-forwarded-for']
    const ip = req.ip || 'unknown';
    if (!requestCounts.has(ip)) {
        // Neuen Zähler starten
        const timer = setTimeout(() => {
            requestCounts.delete(ip);
        }, WINDOW_MS);
        requestCounts.set(ip, { count: 1, timer: timer });
        return next();
    }
    const entry = requestCounts.get(ip);
    entry.count += 1;
    if (entry.count > MAX_REQUESTS_PER_MINUTE) {
        // Limit überschritten
        // Da wir keine genaue Restzeit kennen, geben wir das Fenster an.
        const resetInSeconds = Math.ceil(WINDOW_MS / 1000);
        console.warn(`Rate limit exceeded for IP: ${ip}`);
        return res.status(429).json({
            error: "Too Many Requests",
            message: `Bitte warten Sie. Maximal ${MAX_REQUESTS_PER_MINUTE} Anfragen pro Minute erlaubt.`,
            resetInSeconds: resetInSeconds
        });
    }
    next();
};
// Bereinigung des Zählers beim Stoppen des Prozesses
process.on('exit', () => {
    requestCounts.forEach(entry => clearTimeout(entry.timer));
});
//# sourceMappingURL=rate-limiter.js.map