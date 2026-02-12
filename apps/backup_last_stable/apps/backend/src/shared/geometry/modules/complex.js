"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPLEX_FORMS = void 0;
exports.COMPLEX_FORMS = {
    TORUS: {
        name: "Torus",
        description: "Donut-förmige Minimalfläche",
        calculatePoints: (R = 2, r = 0.5) => {
            const pts = [];
            for (let u = 0; u < Math.PI * 2; u += 0.5)
                for (let v = 0; v < Math.PI * 2; v += 0.5)
                    pts.push({
                        x: (R + r * Math.cos(v)) * Math.cos(u),
                        y: (R + r * Math.cos(v)) * Math.sin(u),
                        z: r * Math.sin(v)
                    });
            return pts;
        }
    },
    KOCH_SNOWFLAKE: {
        name: "Koch-Schneeflocke",
        description: "Fraktale Kurve mit unendlicher Länge",
        formula: "N_n = 3 * 4^n"
    }
};
