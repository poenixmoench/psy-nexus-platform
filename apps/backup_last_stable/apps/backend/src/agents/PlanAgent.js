"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanAgent = void 0;
const tsyringe_1 = require("tsyringe");
const basis_agent_1 = require("@shared/basis-agent");
let PlanAgent = class PlanAgent extends basis_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'PLAN_AGENT';
    }
    async processDelta(delta) {
        const newTags = [];
        const content = (delta.diffContent || '').toLowerCase();
        if (content.includes('migration') || content.includes('frontend')) {
            // 1. TASK-Tag: Hochgradig strukturiert nach AgentTypes.ts
            const taskPayload = {
                type: 'TASK',
                data: {
                    taskId: `task-${Date.now()}`,
                    description: 'Initiate frontend migration analysis',
                    priority: 'HIGH'
                },
                reason: 'Detected frontend migration keyword in delta.'
            };
            newTags.push(this.emitTag(taskPayload, 3600));
            // 2. DATA-Tag: Für den Status-Zustand im System
            const dataPayload = {
                type: 'DATA',
                data: {
                    key: 'migration_status',
                    value: 'analysis_started'
                },
                reason: 'Setting initial migration status flag.'
            };
            newTags.push(this.emitTag(dataPayload, 7200));
        }
        return {
            text: `[${this.name}] Analyse des Deltas ${delta.currentHash.substring(0, 8)} abgeschlossen. ${newTags.length} Tags generiert.`,
            newTags: newTags
        };
    }
};
exports.PlanAgent = PlanAgent;
exports.PlanAgent = PlanAgent = __decorate([
    (0, tsyringe_1.injectable)()
], PlanAgent);
