"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SACRED_GEOMETRY = void 0;
exports.SACRED_GEOMETRY = {
    FLOWER_OF_LIFE: {
        name: "Blume des Lebens",
        description: "Zentrales Muster der heiligen Geometrie aus hexagonal angeordneten Kreisen.",
        calculatePoints: (radius = 1, levels = 3) => {
            const pts = [];
            const step = radius * 1.5;
            for (let q = -levels; q <= levels; q++) {
                for (let r = Math.max(-levels, -q - levels); r <= Math.min(levels, -q + levels); r++) {
                    const x = step * (3 / 2 * q);
                    const y = step * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
                    // Wir speichern die Zentren der Kreise
                    pts.push({ x, y, z: 0 });
                }
            }
            return pts;
        }
    },
    VESICA_PISCIS: {
        name: "Vesica Piscis",
        description: "Schnittmenge zweier Kreise, Symbol für Dualität.",
        symbolism: "Ursprung der Schöpfung",
        formula: "R = r * sqrt(3)",
        metadata: { phiRelation: true },
        calculatePoints: (radius = 1) => {
            const pts = [];
            const offset = radius / 2;
            // Zwei Kreise, die sich überschneiden
            for (let a = 0; a < 2 * Math.PI; a += 0.2) {
                pts.push({ x: radius * Math.cos(a) - offset, y: radius * Math.sin(a), z: 0 });
                pts.push({ x: radius * Math.cos(a) + offset, y: radius * Math.sin(a), z: 0 });
            }
            return pts;
        }
    },
    SRI_YANTRA: {
        name: "Sri Yantra",
        description: "9 ineinandergreifende Dreiecke, die das Universum symbolisieren.",
        metadata: { phiRelation: true },
        calculatePoints: (size = 1) => {
            const pts = [];
            // Generierung von 9 Ebenen (vereinfachte Dreiecks-Symmetrie)
            for (let i = 1; i <= 9; i++) {
                const direction = i % 2 === 0 ? 1 : -1;
                const scale = size * (1 - i * 0.1);
                pts.push({ x: 0, y: direction * scale, z: 0 }, { x: -scale, y: -direction * (scale / 2), z: 0 }, { x: scale, y: -direction * (scale / 2), z: 0 });
            }
            // Der zentrale Bindu-Punkt
            pts.push({ x: 0, y: 0, z: 0 });
            return pts;
        }
    }
};
