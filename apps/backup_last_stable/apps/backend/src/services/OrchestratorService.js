"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const tsyringe_1 = require("tsyringe");
const xstate_1 = require("xstate");
const PsyNexusMachine_1 = require("../machines/PsyNexusMachine");
const StigmergyService_1 = require("./StigmergyService");
const AgentTypes_1 = require("@shared/types/AgentTypes");
const WorkflowRouter_1 = require("@shared/logic/WorkflowRouter"); // Korrekter Import-Pfad
const OllamaAdapter_1 = require("./OllamaAdapter");
const ContextManager_1 = require("@shared/logic/ContextManager");
const uuid_1 = require("uuid");
let OrchestratorService = class OrchestratorService {
    constructor(stigmergyService, ollamaAdapter) {
        this.stigmergyService = stigmergyService;
        this.ollamaAdapter = ollamaAdapter;
        this.circuitBreakerOpen = false;
        this.lastFailureTime = 0;
        this.RESET_TIMEOUT = 60000; // 60 Sek. Abkühlphase
        this.actor = (0, xstate_1.createActor)(PsyNexusMachine_1.psyNexusMachine);
        this.actor.start();
        this.actor.subscribe((snapshot) => {
            console.log(`[Orchestrator] Zustand: ${JSON.stringify(snapshot.context.status)}`);
        });
    }
    // --- XState basierte Methoden ---
    getStatus() {
        return this.actor.getSnapshot().context.status;
    }
    async startWorkflow(input) {
        console.log('[Orchestrator] Starte neuen Workflow...', input);
        this.actor.send({ type: 'START_WORKFLOW', input });
    }
    async agentCompleted(agentName, output) {
        if (!this.isValidAgentType(agentName)) {
            console.warn(`[Orchestrator] ⛔ SECURITY ALERT: Invalid agent '${agentName}' tried to complete task.`);
            this.handleError('INVALID_AGENT', `Agent ${agentName} is not registered.`);
            return;
        }
        console.log(`[Orchestrator] Agent ${agentName} completed work.`);
        // Persistenz
        if (output && output.newTags && output.newTags.length > 0) {
            await this.stigmergyService.saveTags(output.newTags);
        }
        // Zustand aktualisieren
        this.actor.send({
            type: 'AGENT_COMPLETED',
            agent: agentName,
            output
        });
        // Nächsten Schritt basierend auf Workflow-Logik
        const currentState = this.actor.getSnapshot().context.currentStep;
        const nextAgent = WorkflowRouter_1.WorkflowRouter.getNextAgent(currentState);
        if (nextAgent) {
            const requiresApproval = WorkflowRouter_1.WorkflowRouter.requiresApproval(currentState);
            if (requiresApproval) {
                const gateName = WorkflowRouter_1.WorkflowRouter.getApprovalGate(currentState);
                if (gateName) {
                    this.actor.send({
                        type: 'REQUIRE_APPROVAL',
                        gate: gateName,
                        output
                    });
                    console.log(`[Orchestrator] Warte auf Genehmigung für ${gateName}-Gate.`);
                }
            }
            else {
                console.log(`[Orchestrator] Starte nächsten Agenten: ${nextAgent}`);
                // Optional: Hier könnte der nächste Agent automatisch gestartet werden
            }
        }
        else {
            console.log('[Orchestrator] Workflow erfolgreich abgeschlossen.');
        }
    }
    approveGate(gate) {
        console.log(`[Orchestrator] Gate '${gate}' genehmigt.`);
        this.actor.send({ type: 'APPROVE_GATE', gate });
    }
    rejectGate(gate, reason) {
        console.log(`[Orchestrator] Gate '${gate}' abgelehnt: ${reason}`);
        this.actor.send({ type: 'REJECT_GATE', gate, reason });
    }
    // --- Neue kognitive Methoden ---
    async processAgentTask(agentName, task, namespace = 'global') {
        const requestId = (0, uuid_1.v4)().substring(0, 8);
        const startTime = Date.now();
        // 1. Circuit Breaker Check
        if (this.circuitBreakerOpen) {
            if (Date.now() - this.lastFailureTime > this.RESET_TIMEOUT) {
                console.log(`[Orchestrator][${requestId}] Versuche Half-Open Reset...`);
                this.circuitBreakerOpen = false;
            }
            else {
                throw new Error(`[Orchestrator] Circuit Breaker ist offen. System kühlt ab.`);
            }
        }
        console.log(`[Orchestrator][${requestId}] Start: ${agentName} | Namespace: ${namespace}`);
        try {
            // 2. Kontext-Laden & Filtern (Refactored)
            const relevantContext = await this.loadContext(agentName, namespace);
            // 3. KI-Inference
            const aiResponse = await this.ollamaAdapter.askAgent(agentName, task, relevantContext);
            // 4. Resultat persistieren
            const newTag = await this.persistResult(agentName, namespace, aiResponse, requestId);
            const duration = Date.now() - startTime;
            console.log(`[Orchestrator][${requestId}] SUCCESS: ${agentName} in ${duration}ms (Tag: ${newTag.id})`);
            return aiResponse;
        }
        catch (error) {
            this.handleFailure(requestId, agentName, error);
            throw error;
        }
    }
    // --- Hilfsmethoden für kognitive Verarbeitung ---
    async loadContext(agentName, namespace) {
        const fullHistory = await this.stigmergyService.getTagsByNamespace(namespace);
        return ContextManager_1.ContextManager.calculateDelta(fullHistory, agentName);
    }
    async persistResult(agentName, namespace, data, requestId) {
        return await this.stigmergyService.createTag({
            sourceAgent: agentName,
            namespace: namespace,
            priority: 'MEDIUM',
            payload: {
                type: 'DATA',
                data,
                reason: `RequestID: ${requestId}`
            }
        });
    }
    handleFailure(requestId, agentName, error) {
        console.error(`[Orchestrator][${requestId}] FAIL: Agent ${agentName} ->`, error.message);
        this.circuitBreakerOpen = true;
        this.lastFailureTime = Date.now();
    }
    // --- Validierung ---
    isValidAgentType(type) {
        return AgentTypes_1.KnownAgentTypeValues.includes(type);
    }
    handleError(code, message) {
        this.actor.send({ type: 'WORKFLOW_ERROR', code, message });
    }
};
exports.OrchestratorService = OrchestratorService;
exports.OrchestratorService = OrchestratorService = __decorate([
    (0, tsyringe_1.singleton)(),
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [StigmergyService_1.StigmergyService,
        OllamaAdapter_1.OllamaAdapter])
], OrchestratorService);
