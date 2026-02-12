"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATONIC_SOLIDS = void 0;
exports.PLATONIC_SOLIDS = {
    TETRAHEDRON: {
        name: "Tetraeder",
        description: "4 Flächen, 4 Ecken",
        element: "Feuer",
        faces: 4,
        vertices: 4,
        formula: "V - E + F = 2",
        calculatePoints: (size = 1) => [
            { x: size, y: size, z: size }, { x: -size, y: -size, z: size },
            { x: -size, y: size, z: -size }, { x: size, y: -size, z: -size }
        ]
    },
    HEXAHEDRON: {
        name: "Hexaeder",
        description: "6 Flächen (Würfel)",
        element: "Erde",
        faces: 6,
        vertices: 8,
        formula: "a³"
    }
};
