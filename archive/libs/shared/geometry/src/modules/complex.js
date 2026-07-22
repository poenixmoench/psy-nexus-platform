"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPLEX_FORMS = void 0;
exports.COMPLEX_FORMS = {
    SIERPINSKI: {
        name: "Sierpinski Dreieck",
        description: "Fraktale Struktur aus rekursiven Dreiecken.",
        calculatePoints: (depth = 3, size = 1) => {
            const pts = [];
            const generate = (p1, p2, p3, d) => {
                if (d === 0) {
                    pts.push(p1, p2, p3);
                    return;
                }
                const p12 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2 };
                const p23 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2, z: (p2.z + p3.z) / 2 };
                const p31 = { x: (p3.x + p1.x) / 2, y: (p3.y + p1.y) / 2, z: (p3.z + p1.z) / 2 };
                generate(p1, p12, p31, d - 1);
                generate(p12, p2, p23, d - 1);
                generate(p31, p23, p3, d - 1);
            };
            generate({ x: 0, y: size, z: 0 }, { x: -size, y: -size, z: 0 }, { x: size, y: -size, z: 0 }, depth);
            return pts;
        }
    },
    LOG_SPIRAL: {
        name: "Logarithmische Spirale",
        description: "Wachstumsmuster der Natur (Goldener Schnitt).",
        calculatePoints: (revolutions = 3, a = 0.1, b = 0.1759) => {
            const pts = [];
            for (let theta = 0; theta < Math.PI * 2 * revolutions; theta += 0.1) {
                const r = a * Math.exp(b * theta);
                pts.push({
                    x: r * Math.cos(theta),
                    y: r * Math.sin(theta),
                    z: theta * 0.1
                });
            }
            return pts;
        }
    }
};
