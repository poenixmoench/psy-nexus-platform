export const PLATONIC_SOLIDS = {
    TETRAHEDRON: {
        name: "Tetraeder",
        description: "Feuer",
        calculatePoints: (s: number = 100) => [
            {x: s, y: s, z: s}, {x: -s, y: -s, z: s}, {x: -s, y: s, z: -s}, {x: s, y: -s, z: -s}
        ]
    },
    HEXAHEDRON: {
        name: "Hexaeder",
        description: "Erde",
        calculatePoints: (s: number = 100) => {
            const pts = [];
            for(let x of [-s,s]) for(let y of [-s,s]) for(let z of [-s,s]) pts.push({x,y,z});
            return pts;
        }
    },
    OCTAHEDRON: {
        name: "Oktaeder",
        description: "Luft",
        calculatePoints: (s: number = 100) => [
            {x: s, y: 0, z: 0}, {x: -s, y: 0, z: 0}, {x: 0, y: s, z: 0}, 
            {x: 0, y: -s, z: 0}, {x: 0, y: 0, z: s}, {x: 0, y: 0, z: -s}
        ]
    },
    ICOSAHEDRON: {
        name: "Ikosaeder",
        description: "Wasser (Phi-Ratio)",
        calculatePoints: (s: number = 100) => {
            const phi = (1 + Math.sqrt(5)) / 2;
            const pts: any[] = [];
            [[0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
             [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
             [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1]].forEach(v => {
                pts.push({ x: v[0]*s, y: v[1]*s, z: v[2]*s });
            });
            return pts;
        }
    },
    DODECAHEDRON: {
        name: "Dodekaeder",
        description: "Äther (Phi-Ratio)",
        calculatePoints: (s: number = 100) => {
            const phi = (1 + Math.sqrt(5)) / 2;
            const ip = 1 / phi;
            const pts: any[] = [];
            for(let x of [-1,1]) for(let y of [-1,1]) for(let z of [-1,1]) pts.push({x: x*s, y: y*s, z: z*s});
            [[0, ip, phi], [0, ip, -phi], [0, -ip, phi], [0, -ip, -phi],
             [ip, phi, 0], [ip, -phi, 0], [-ip, phi, 0], [-ip, -phi, 0],
             [phi, 0, ip], [phi, 0, -ip], [-phi, 0, ip], [-phi, 0, -ip]].forEach(v => {
                pts.push({ x: v[0]*s, y: v[1]*s, z: v[2]*s });
            });
            return pts;
        }
    }
};
