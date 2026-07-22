"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEOMETRY_UTILS = exports.GeometryCache = exports.MATHEMATICAL_CONSTANTS = void 0;
exports.MATHEMATICAL_CONSTANTS = {
    PHI: 1.618033988749895,
    PI: 3.141592653589793,
    SQRT3_DIV2: Math.sqrt(3) / 2,
    E: 2.718281828459045,
    MAX_ITERATION_DEPTH: 15
};
class GeometryCache {
    constructor() {
        this.cache = new Map();
    }
    static getInstance() {
        if (!GeometryCache.instance)
            GeometryCache.instance = new GeometryCache();
        return GeometryCache.instance;
    }
    get(key) { return this.cache.get(key); }
    set(key, value) { this.cache.set(key, value); }
    clear() { this.cache.clear(); }
}
exports.GeometryCache = GeometryCache;
exports.GEOMETRY_UTILS = {
    // Punkte auf eine Box von -1 bis 1 normalisieren
    normalize: (points) => {
        const xs = points.map(p => p.x), ys = points.map(p => p.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const scale = Math.max(maxX - minX, maxY - minY);
        return points.map(p => ({
            x: (p.x - minX) / scale * 2 - 1,
            y: (p.y - minY) / scale * 2 - 1,
            z: p.z ? p.z / scale * 2 - 1 : 0
        }));
    },
    // Der Mandala-Generator: Rotiert eine Form n-mal
    // Erzeugt Dreiecke, Vierecke, Sechsecke etc.
    generatePolygon: (sides, radius = 1) => {
        const pts = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * 2 * Math.PI;
            pts.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 0 });
        }
        return pts;
    },
    createMandala: (baseShape, repetitions = 6) => {
        const pts = [];
        for (let i = 0; i < repetitions; i++) {
            const angle = (i * 2 * exports.MATHEMATICAL_CONSTANTS.PI) / repetitions;
            baseShape.forEach(p => {
                pts.push({
                    x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
                    y: p.x * Math.sin(angle) + p.y * Math.cos(angle),
                    z: p.z || 0
                });
            });
        }
        return pts;
    }
};
