"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_PROFILES = void 0;
exports.AGENT_PROFILES = {
    OrionAgent: {
        id: 'OrionAgent',
        name: 'OrionAgent',
        role: "Strategic Nexus Lead",
        description: "Lead Architect & Design-Trend-Scout. Orchestriert den Workflow nach der PSY-NEXUS CORE-CONSTITUTION.",
        category: "Strategic",
        color: "#00f2ff",
        status: "active"
    },
    PlanAgent: {
        id: 'PlanAgent',
        name: 'PlanAgent',
        role: "Workflow-Architect",
        description: "Projekt-Koordination und Link-Graph-Precision. Fokus auf Manifest-Integrität und strategische Planung.",
        category: "Management",
        color: "#7000ff",
        status: "active"
    },
    DesignAlchemistAgent: {
        id: 'DesignAlchemistAgent',
        name: 'DesignAlchemistAgent',
        role: "Visual Alchemist & Geometry Engine Lead",
        description: "Nutzt vordefinierte mathematische Modelle aus /shared/math/geometry. Implementiert Sacred Geometry (Phi, Fibonacci, LCH) durch direkten Zugriff auf die Formelsammlung.",
        category: "Design",
        color: "#ff0055",
        formulaPath: "libs/shared/geometry",
        status: "active"
    },
    FrontendMeisterAgent: {
        id: 'FrontendMeisterAgent',
        name: 'FrontendMeisterAgent',
        role: "SEO & Interface Constructor",
        description: "Erstellt performante Vue3 Komponenten. Fokus auf Core Web Vitals, semantisches HTML und Clean Code Standards.",
        category: "Frontend",
        color: "#00ff88",
        status: "active"
    },
    BackendArchitectAgent: {
        id: 'BackendArchitectAgent',
        name: 'BackendArchitectAgent',
        role: "Logic-Infrastruct",
        description: "Wächter der API-Integrität. Optimiert Multi-Threading und Ressourcen-Nutzung auf Hetzner-Infrastruktur.",
        category: "Backend",
        color: "#ffaa00",
        status: "active"
    },
    QaGuruAgent: {
        role: "Reliability Guard",
        id: 'QaGuruAgent',
        name: 'QaGuruAgent',
        description: "Validiert Code-Standards (WCAG 2.1) und SEO-Integrität. Verhindert Redundanzen und sichert DRY-Compliance.",
        category: "QA",
        color: "#00aaff",
        status: "active"
    },
    OptimizerAgent: {
        id: 'OptimizerAgent',
        name: 'OptimizerAgent',
        role: "Efficiency Tuner",
        description: "Refactored Code für maximale Lesbarkeit. Hinterlässt das System immer sauberer als zuvor.",
        category: "Optimization",
        color: "#ffff00",
        status: "active"
    },
    DokumentationAgent: {
        id: 'DokumentationAgent',
        name: 'DokumentationAgent',
        role: "Deployment-Chronist",
        description: "Finaler Code-Validator. Stellt die Produktionsreife sicher und dokumentiert alle mathematischen Modelle.",
        category: "Support",
        color: "#ffffff",
        status: "active"
    }
};
