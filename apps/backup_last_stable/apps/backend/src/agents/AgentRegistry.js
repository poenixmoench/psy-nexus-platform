"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_MAP = exports.KNOWN_AGENTS_SET = exports.BaseAgent = void 0;
exports.mapToInternalType = mapToInternalType;
const AgentTypes_1 = require("@shared/types/AgentTypes");
const basis_agent_1 = require("@shared/basis-agent");
Object.defineProperty(exports, "BaseAgent", { enumerable: true, get: function () { return basis_agent_1.BaseAgent; } });
const OrionAgent_1 = require("./OrionAgent");
const PlanAgent_1 = require("./PlanAgent");
const DesignAlchemistAgent_1 = require("./DesignAlchemistAgent");
const FrontendMeisterAgent_1 = require("./FrontendMeisterAgent");
const BackendArchitektAgent_1 = require("./BackendArchitektAgent");
const QaGuruAgent_1 = require("./QaGuruAgent");
const OptimiererAgent_1 = require("./OptimiererAgent");
const DokumentationAgent_1 = require("./DokumentationAgent");
exports.KNOWN_AGENTS_SET = new Set(AgentTypes_1.KnownAgentTypeValues);
exports.AGENT_MAP = {
    'ORION_AGENT': OrionAgent_1.OrionAgent,
    'PLAN_AGENT': PlanAgent_1.PlanAgent,
    'DESIGN_ALCHEMIST_AGENT': DesignAlchemistAgent_1.DesignAlchemistAgent,
    'FRONTEND_MEISTER_AGENT': FrontendMeisterAgent_1.FrontendMeisterAgent,
    'BACKEND_ARCHITEKT_AGENT': BackendArchitektAgent_1.BackendArchitektAgent,
    'QA_GURU_AGENT': QaGuruAgent_1.QaGuruAgent,
    'OPTIMIERER_AGENT': OptimiererAgent_1.OptimiererAgent,
    'DOKUMENTATION_AGENT': DokumentationAgent_1.DokumentationAgent,
};
function mapToInternalType(type) {
    if (!exports.KNOWN_AGENTS_SET.has(type)) {
        console.warn(`[REGISTRY] Warnung: Unbekannter Agenten-Typ "${type}". Fallback auf ORION_AGENT.`);
        return 'ORION_AGENT';
    }
    return type;
}
