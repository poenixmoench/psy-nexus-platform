"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VORTEX_MATH = void 0;
exports.VORTEX_MATH = {
    // Die heilige Zahlenfolge nach Marco Rodin
    RODIN_SEQUENCE: [1, 2, 4, 8, 7, 5],
    calculateVortexPoints: (radius = 1, height = 2) => {
        const pts = [];
        exports.VORTEX_MATH.RODIN_SEQUENCE.forEach((num, i) => {
            const angle = (i / 6) * 2 * Math.PI;
            pts.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                z: (height / 6) * i
            });
        });
        return pts;
    }
};
