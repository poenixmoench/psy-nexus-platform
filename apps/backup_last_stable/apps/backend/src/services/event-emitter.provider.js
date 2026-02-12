"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = void 0;
const eventemitter2_1 = require("eventemitter2");
const tsyringe_1 = require("tsyringe");
exports.eventEmitter = new eventemitter2_1.EventEmitter2({
    wildcard: true,
    delimiter: '.',
    maxListeners: 20
});
// Registrierung als Singleton im Container
tsyringe_1.container.registerInstance(eventemitter2_1.EventEmitter2, exports.eventEmitter);
