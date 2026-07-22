import { IGeometryPoint } from '../types';

export const TOPOLOGY = {
    KLEIN_BOTTLE: {
        name: "Klein Bottle",
        description: "Geschlossene nicht-orientierbare Fläche",
        symbolism: "Unendlicher Zyklus ohne Innen/Außen",
        calculatePoints: (r: number = 100) => {
            const points: IGeometryPoint[] = [];
            for (let u = 0; u < Math.PI * 2; u += 0.2) {
                for (let v = 0; v < Math.PI * 2; v += 0.2) {
                    const x = (r + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u);
                    const y = (r + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u);
                    const z = Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v);
                    points.push({ x: x * r / 3, y: y * r / 3, z: z * r / 3 });
                }
            }
            return points;
        }
    }
};
