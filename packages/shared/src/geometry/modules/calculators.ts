import { IGeometryPoint } from '../types';

export const GEOMETRY_CALCULATORS = {
    TORUS: {
        name: "Torus",
        description: "Ringförmige Oberfläche (Donut)",
        symbolism: "Endloser Zyklus & Toroidalfluss",
        calculatePoints: (R: number = 100, r: number = 30) => {
            const points: IGeometryPoint[] = [];
            for (let u = 0; u < Math.PI * 2; u += 0.2) {
                for (let v = 0; v < Math.PI * 2; v += 0.2) {
                    points.push({
                        x: (R + r * Math.cos(v)) * Math.cos(u),
                        y: (R + r * Math.cos(v)) * Math.sin(u),
                        z: r * Math.sin(v)
                    });
                }
            }
            return points;
        }
    },
    KOCH_SNOWFLAKE: {
        name: "Koch-Schneeflocke",
        description: "Fraktale Kurve mit unendlicher Komplexität",
        symbolism: "Selbstähnlichkeit",
        calculatePoints: (r: number = 100) => {
            const points: IGeometryPoint[] = [];
            for (let i = 0; i < 6; i++) {
                const baseAngle = (i / 6) * Math.PI * 2;
                for (let j = 0; j <= 20; j++) {
                    const dist = r * (j / 20);
                    const jitter = (j % 2 === 0) ? 5 : -5;
                    points.push({
                        x: Math.cos(baseAngle) * dist + jitter,
                        y: Math.sin(baseAngle) * dist + jitter,
                        z: 0
                    });
                }
            }
            return points;
        }
    },
    MOBIUS_STRIP: {
        name: "Möbius Strip",
        description: "Nicht-orientierbare, einseitige Fläche",
        symbolism: "Einheit von Gegensätzen",
        calculatePoints: (r: number = 100) => {
            const points: IGeometryPoint[] = [];
            for (let u = 0; u < Math.PI * 2; u += 0.1) {
                for (let v = -30; v <= 30; v += 10) {
                    points.push({
                        x: (r + v * Math.cos(u / 2)) * Math.cos(u),
                        y: (r + v * Math.cos(u / 2)) * Math.sin(u),
                        z: v * Math.sin(u / 2)
                    });
                }
            }
            return points;
        }
    }
};
