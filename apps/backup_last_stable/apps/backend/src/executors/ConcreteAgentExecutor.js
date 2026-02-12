"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcreteAgentExecutor = void 0;
const tsyringe_1 = require("tsyringe");
const index_1 = require("../di/index");
const AgentRegistry_1 = require("../agents/AgentRegistry");
let ConcreteAgentExecutor = class ConcreteAgentExecutor {
    async execute(agentName, input) {
        // 1. Mapping versuchen
        const mappedInternalName = (0, AgentRegistry_1.mapToInternalType)(agentName);
        // 2. Prüfung: Ist der Name (gemappt oder original) auflösbar?
        let finalName;
        // Definiere normalizedAgentName für den zweiten Check
        const normalizedAgentName = agentName.trim().toUpperCase().replace(/-/g, '_');
        if (AgentRegistry_1.KNOWN_AGENTS_SET.has(mappedInternalName)) {
            finalName = mappedInternalName;
        }
        else if (AgentRegistry_1.KNOWN_AGENTS_SET.has(normalizedAgentName)) {
            finalName = normalizedAgentName;
        }
        else {
            // 3. Fehlerbehandlung
            const availableInternal = Object.keys(AgentRegistry_1.AGENT_MAP).join(', ');
            throw new Error(`Agent "${agentName}" konnte nicht aufgelöst werden. ` +
                `Verfügbare interne Klassen: [${availableInternal}].`);
        }
        // 4. Erfolgreiche Auflösung
        const agent = index_1.container.resolve(finalName);
        return agent.processDelta(input);
    }
};
exports.ConcreteAgentExecutor = ConcreteAgentExecutor;
exports.ConcreteAgentExecutor = ConcreteAgentExecutor = __decorate([
    (0, tsyringe_1.injectable)()
], ConcreteAgentExecutor);
