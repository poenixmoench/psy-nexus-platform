"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendMeisterAgent = void 0;
const tsyringe_1 = require("tsyringe");
const basis_agent_1 = require("@shared/basis-agent");
let FrontendMeisterAgent = class FrontendMeisterAgent extends basis_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'FRONTEND_MEISTER_AGENT';
    }
    async processDelta(delta) {
        const newTags = [];
        if ((delta.diffContent || '').toLowerCase().includes('frontend')) {
            newTags.push(this.emitTag({ type: 'DATA', data: { key: 'ui_refinement', value: 'pending' }, reason: 'Detected frontend change.' }, 3600));
        }
        return { text: `[${this.name}] Frontend-Präzision wird angewandt.`, newTags };
    }
};
exports.FrontendMeisterAgent = FrontendMeisterAgent;
exports.FrontendMeisterAgent = FrontendMeisterAgent = __decorate([
    (0, tsyringe_1.injectable)()
], FrontendMeisterAgent);
