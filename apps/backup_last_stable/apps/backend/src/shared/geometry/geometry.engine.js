"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEOMETRY_ENGINE = void 0;
const platonic_1 = require("./modules/platonic");
const sacred_1 = require("./modules/sacred");
const complex_1 = require("./modules/complex");
exports.GEOMETRY_ENGINE = {
    PLATONIC_SOLIDS: platonic_1.PLATONIC_SOLIDS,
    SACRED_GEOMETRY: sacred_1.SACRED_GEOMETRY,
    COMPLEX_FORMS: complex_1.COMPLEX_FORMS,
    CALCULATORS: {
        getSpiral: (n) => { }
    }
};
