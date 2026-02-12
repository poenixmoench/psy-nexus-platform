"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendArchitektAgent = void 0;
const tsyringe_1 = require("tsyringe");
const basis_agent_1 = require("@shared/basis-agent");
let BackendArchitektAgent = class BackendArchitektAgent extends basis_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'BACKEND_ARCHITEKT_AGENT';
    }
    async processDelta(delta) {
        return {
            text: `[${this.name}] Delta ${delta.currentHash.substring(0, 8)} erfolgreich verarbeitet.`,
            newTags: []
        };
    }
};
exports.BackendArchitektAgent = BackendArchitektAgent;
exports.BackendArchitektAgent = BackendArchitektAgent = __decorate([
    (0, tsyringe_1.injectable)()
], BackendArchitektAgent);
