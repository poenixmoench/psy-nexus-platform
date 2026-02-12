"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DokumentationAgent = void 0;
const tsyringe_1 = require("tsyringe");
const basis_agent_1 = require("@shared/basis-agent");
let DokumentationAgent = class DokumentationAgent extends basis_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'DOKUMENTATION_AGENT';
    }
    async processDelta(delta) {
        const newTags = [];
        return { text: `[${this.name}] Delta-Historie wird für die Wissensdatenbank aufbereitet.`, newTags };
    }
};
exports.DokumentationAgent = DokumentationAgent;
exports.DokumentationAgent = DokumentationAgent = __decorate([
    (0, tsyringe_1.injectable)()
], DokumentationAgent);
