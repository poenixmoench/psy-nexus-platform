"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEOMETRY_CALCULATORS = void 0;
const utils_1 = require("../utils");
exports.GEOMETRY_CALCULATORS = {
    // Exakte Ramer-Douglas-Peucker Implementierung aus der Engine
    compressPoints: (points, tolerance = 0.1) => {
        if (points.length <= 2)
            return points;
        const first = points[0];
        const last = points[points.length - 1];
        let maxDist = 0;
        let maxIndex = 0;
        for (let i = 1; i < points.length - 1; i++) {
            const dist = Math.abs((last.y - first.y) * points[i].x -
                (last.x - first.x) * points[i].y +
                last.x * first.y - last.y * first.x) / Math.sqrt(Math.pow(last.y - first.y, 2) + Math.pow(last.x - first.x, 2));
            if (dist > maxDist) {
                maxDist = dist;
                maxIndex = i;
            }
        }
        if (maxDist > tolerance) {
            const left = exports.GEOMETRY_CALCULATORS.compressPoints(points.slice(0, maxIndex + 1), tolerance);
            const right = exports.GEOMETRY_CALCULATORS.compressPoints(points.slice(maxIndex), tolerance);
            return [...left.slice(0, -1), ...right];
        }
        return [first, last];
    },
    // Quadratische Bezier-Kurve mit exakter Gewichtung
    calculateBezierCurve: (start, control, end, steps = 100) => {
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            pts.push({
                x: Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x,
                y: Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y,
                z: 0
            });
        }
        return pts;
    },
    // Lineare Interpolation (Lerp) für Agenten-Bewegungen
    calculateLinearInterpolation: (start, end, steps = 100) => {
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            pts.push({
                x: start.x + t * (end.x - start.x),
                y: start.y + t * (end.y - start.y),
                z: (start.z || 0) + t * ((end.z || 0) - (start.z || 0))
            });
        }
        return pts;
    },
    // Mandala-Symmetrie (Rotiert die Base-Shape exakt nach Engine-Vorgabe)
    calculateMandalaSymmetry: (baseShape, repetitions = 8) => {
        const pts = [];
        const angleStep = (2 * utils_1.MATHEMATICAL_CONSTANTS.PI) / repetitions;
        for (let i = 0; i < repetitions; i++) {
            const angle = i * angleStep;
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
