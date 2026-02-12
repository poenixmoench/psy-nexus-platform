"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrionAgent = void 0;
const tsyringe_1 = require("tsyringe");
const AgentRegistry_1 = require("./AgentRegistry");
let OrionAgent = class OrionAgent extends AgentRegistry_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'ORION_AGENT';
    }
    async processDelta(delta) {
        const newTags = [];
        const topTask = this.getHighestPriorityTask(delta.activeTags);
        if (topTask) {
            newTags.push(this.emitTag({
                type: 'DATA',
                data: { key: 'orion_focus', value: (topTask.data || topTask.payload?.data).taskId },
                reason: 'Orion synchronizes on top priority.'
            }, 1800));
        }
        return {
            text: `[${this.name}] Prime Directive aktiv. Überwache Stigmergie-Fluss.`,
            newTags
        };
    }
};
exports.OrionAgent = OrionAgent;
exports.OrionAgent = OrionAgent = __decorate([
    (0, tsyringe_1.injectable)()
], OrionAgent);
