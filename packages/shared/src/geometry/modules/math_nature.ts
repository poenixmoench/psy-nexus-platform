export const MATH_NATURE = {
    FIBONACCI_SPIRAL: {
        name: "Fibonacci Spirale",
        description: "Wachstumsspirale",
        calculatePoints: (r: number = 100) => {
            const pts = [];
            const phi = (1 + Math.sqrt(5)) / 2;
            for (let i = 0; i < 50; i++) {
                const angle = 0.1 * i;
                const dist = Math.pow(phi, angle) * (r / 10);
                pts.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, z: 0 });
            }
            return pts;
        }
    },
    GOLDEN_RATIO_SHELL: {
        name: "Phi-Muschel",
        description: "Logarithmische Spirale",
        calculatePoints: (r: number = 100) => {
            const pts = [];
            const phi = 1.61803398875;
            for (let i = 0; i < 100; i++) {
                const t = i * 0.1;
                const scale = Math.pow(phi, 2 * t / Math.PI);
                pts.push({ x: Math.cos(t) * scale * (r/10), y: Math.sin(t) * scale * (r/10), z: t * 5 });
            }
            return pts;
        }
    }
};
