import { IGeometryPoint } from '../types';

export const HYPERGEOMETRY = {
    TESSERACT: {
        name: "Tesseract (4D Hypercube)",
        description: "Vierdimensionaler Würfel projiziert auf 3D",
        calculatePoints: (r: number = 100) => {
            const points: IGeometryPoint[] = [];
            const vertices = [
                [-1,-1,-1,-1], [-1,-1,-1,1], [-1,-1,1,-1], [-1,-1,1,1],
                [-1,1,-1,-1], [-1,1,-1,1], [-1,1,1,-1], [-1,1,1,1],
                [1,-1,-1,-1], [1,-1,-1,1], [1,-1,1,-1], [1,-1,1,1],
                [1,1,-1,-1], [1,1,-1,1], [1,1,1,-1], [1,1,1,1]
            ];
            const w = 2;
            vertices.forEach(v => {
                const factor = 1 / (w - v[3]);
                points.push({ x: v[0] * r * factor, y: v[1] * r * factor, z: v[2] * r * factor });
            });
            return points;
        }
    }
};
