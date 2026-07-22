export const SACRED_GEOMETRY = {
    FLOWER_OF_LIFE: {
        name: "Blume des Lebens",
        description: "19 Kreise der Schöpfung",
        symbolism: "Universelles Leben",
        calculatePoints: (r: number = 100) => {
            const points: any[] = [];
            for (let q = -3; q <= 3; q++) {
                for (let r_pos = Math.max(-3, -q - 3); r_pos <= Math.min(3, -q + 3); r_pos++) {
                    points.push({ x: r * 1.5 * q, y: r * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r_pos), z: 0 });
                }
            }
            return points;
        }
    },
    SEED_OF_LIFE: {
        name: "Seed of Life",
        description: "7 Kreise der Genesis",
        symbolism: "Ursprung",
        calculatePoints: (r: number = 100) => {
            const pts = [{x: 0, y: 0, z: 0}];
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0 });
            }
            return pts;
        }
    },
    MERKABA: {
        name: "Merkaba",
        description: "Stern-Tetraeder",
        symbolism: "Lichtkörper",
        calculatePoints: (r: number = 100) => {
            const s = r * Math.sqrt(8/3);
            return [
                {x: 0, y: 0, z: r}, {x: s, y: 0, z: -r/3}, {x: -s/2, y: s*Math.sqrt(3)/2, z: -r/3},
                {x: 0, y: 0, z: -r}, {x: -s, y: 0, z: r/3}, {x: s/2, y: -s*Math.sqrt(3)/2, z: r/3}
            ];
        }
    },
    METATRON: {
        name: "Metatron Cube",
        description: "Göttliche Ordnung",
        symbolism: "Schutz",
        calculatePoints: (r: number = 100) => {
            const pts = [{x: 0, y: 0, z: 0}];
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0 });
                pts.push({ x: Math.cos(a) * r * 2, y: Math.sin(a) * r * 2, z: 0 });
            }
            return pts;
        }
    },
    VESICA_PISCIS: {
        name: "Vesica Piscis",
        description: "Schnittpunkt der Kreise",
        symbolism: "Duality",
        calculatePoints: (r: number = 100) => [{x: -r/2, y: 0, z: 0}, {x: r/2, y: 0, z: 0}]
    },
    SRI_YANTRA: {
        name: "Sri Yantra",
        description: "Matrix des Kosmos",
        symbolism: "Einheit",
        calculatePoints: (r: number = 100) => {
            const pts = [];
            for (let i = 0; i < 9; i++) {
                const a = (i / 9) * Math.PI * 2;
                pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0 });
            }
            return pts;
        }
    }
};
