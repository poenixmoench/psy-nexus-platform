import { IGeometryPoint } from '../types';

export const CHAOS = {
    LORENZ_ATTRACTOR: {
        name: "Lorenz Attractor",
        description: "Chaotisches System",
        calculatePoints: (r: number = 100) => {
            const points: IGeometryPoint[] = [];
            const sigma = 10, rho = 28, beta = 8/3;
            let x = 0.1, y = 0, z = 0, dt = 0.01;
            for (let i = 0; i < 2000; i++) {
                x += sigma * (y - x) * dt;
                y += (x * (rho - z) - y) * dt;
                z += (x * y - beta * z) * dt;
                points.push({ x: x * r / 50, y: y * r / 50, z: (z - 25) * r / 50 });
            }
            return points;
        }
    }
};
