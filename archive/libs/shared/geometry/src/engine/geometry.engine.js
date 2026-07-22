"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryEngine = void 0;
class GeometryEngine {
    constructor() {
        this.forms = new Map();
        this.initializeBaseForms();
    }
    initializeBaseForms() {
        const baseForms = {
            "icosahedron": { name: "Ikosaeder", faces: 20, description: "Wasser-Element" },
            "dodecahedron": { name: "Dodekaeder", faces: 12, description: "Äther-Element" },
            "torus": { name: "Torus", formula: "R-r", description: "Dynamik" }
        };
        Object.entries(baseForms).forEach(([key, value]) => {
            this.forms.set(key, value);
        });
    }
    getForm(id) {
        return this.forms.get(id);
    }
    getAllForms() {
        return Array.from(this.forms.values());
    }
}
exports.GeometryEngine = GeometryEngine;
