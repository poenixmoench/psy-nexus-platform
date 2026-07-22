export const ADVANCED_SHAPES = {
    CYLINDER: {
        name: "Zylinder",
        description: "3D Säule",
        calculatePoints: (r: number = 100, h: number = 200) => {
            const pts = [];
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * Math.PI * 2;
                pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: h / 2 });
                pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -h / 2 });
            }
            return pts;
        }
    },
    OLOID: {
        name: "Oloid",
        description: "Abrollbare Fläche",
        calculatePoints: (r: number = 100) => {
            const pts = [];
            for(let t=0; t<Math.PI*2; t+=0.2) {
                pts.push({x: r*Math.cos(t), y: 0, z: r*Math.sin(t)});
                pts.push({x: r, y: r*Math.cos(t), z: r*Math.sin(t)});
            }
            return pts;
        }
    }
};
