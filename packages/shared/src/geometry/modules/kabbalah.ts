import { IGeometryPoint } from '../types';

export const KABBALAH = {
    TREE_OF_LIFE: {
        name: "Tree of Life",
        description: "10 Sephiroth",
        calculatePoints: (r: number = 100) => {
            const points: IGeometryPoint[] = [];
            const sephiroth = [
                {x: 0, y: 3}, {x: -1, y: 2}, {x: 1, y: 2},
                {x: 0, y: 1}, {x: 0, y: 0}, {x: 0, y: -1},
                {x: -1, y: -1}, {x: 1, y: -1}, {x: 0, y: -2}, {x: 0, y: -3}
            ];
            sephiroth.forEach(s => points.push({ x: s.x * r / 3, y: s.y * r / 3, z: 0 }));
            return points;
        }
    }
};
