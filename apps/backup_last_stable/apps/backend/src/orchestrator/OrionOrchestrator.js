"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrionOrchestrator = void 0;
const tsyringe_1 = require("tsyringe");
const zod_1 = require("zod");
const GeometryTool_1 = require("../tools/GeometryTool");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const DOC_ANALYSIS_SCHEMA = zod_1.z.object({
    analysis: zod_1.z.object({
        primaryDomain: zod_1.z.string(),
        entities: zod_1.z.array(zod_1.z.string()),
        seoElements: zod_1.z.object({
            headings: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())),
            missingCritical: zod_1.z.array(zod_1.z.string())
        }),
        potentialIntent: zod_1.z.string(),
        targetAudienceClues: zod_1.z.array(zod_1.z.string())
    }),
    recommendations: zod_1.z.object({
        jsonLdProposal: zod_1.z.string(),
        structuralSuggestions: zod_1.z.array(zod_1.z.string())
    })
});
let OrionOrchestrator = class OrionOrchestrator {
    constructor(logger, agentExecutor, geometryTool) {
        this.logger = logger;
        this.agentExecutor = agentExecutor;
        this.geometryTool = geometryTool;
        this.currentManifest = null;
        this.VOLUME_BASE = '/mnt/HC_Volume_103847079/psy-nexus-library';
        this.MANIFEST_PATH = path.join(this.VOLUME_BASE, 'manifests/psy-nexus-main.json');
    }
    async initialize() {
        await this.ensureVolumePaths();
        try {
            await this.loadManifestFromVolume();
        }
        catch (err) {
            this.currentManifest = this.getDefaultManifest();
        }
    }
    async ensureVolumePaths() {
        const dirs = [path.dirname(this.MANIFEST_PATH), path.join(this.VOLUME_BASE, 'code-snapshots')];
        for (const d of dirs)
            await fs.mkdir(d, { recursive: true });
    }
    async loadManifestFromVolume() {
        const data = await fs.readFile(this.MANIFEST_PATH, 'utf-8');
        this.currentManifest = JSON.parse(data);
    }
    getDefaultManifest() {
        return {
            projectName: "Psy-Nexus",
            globalStyle: { theme: "Klarheit & Fokus", colors: [], fonts: [] },
            pages: [],
            lastMilestone: "Initialisierung",
            updatedAt: new Date().toISOString()
        };
    }
    getCurrentManifest() {
        return this.currentManifest || this.getDefaultManifest();
    }
    validateAgentOutput(output, schema) {
        let rawJson = output;
        const markdownMatch = output.match(/```json\s*\n([\s\S]*?)\n\s*```/);
        if (markdownMatch)
            rawJson = markdownMatch[1].trim();
        const parsed = JSON.parse(rawJson.match(/\{[\s\S]*\}/)?.[0] || rawJson);
        return schema.parse(parsed);
    }
    async processRequestStreaming(request, onChunk) {
        const input = request.input.toLowerCase();
        // 1. Dokumentation
        if (request.agent === "DokumentationAgent" || request.agent === "DOKUMENTATION_AGENT") {
            onChunk("\n[ORION]: Analyse läuft...\n");
            const docResult = await this.agentExecutor.execute(request.agent, { query: request.input });
            const extractedData = this.validateAgentOutput(docResult.output, DOC_ANALYSIS_SCHEMA);
            return await this.agentExecutor.execute("ORION_AGENT", {
                query: `SYNTHESE: ${JSON.stringify(extractedData)}`,
                context: { ...request.sessionData, docAnalysis: extractedData }
            });
        }
        // 2. Geometrie Hook - korrigiert
        if (input.includes("tetraeder") || input.includes("geometrie")) {
            onChunk("\n[ORION]: Geometrie-Kern aktiv...\n");
            try {
                // Korrekter Aufruf mit allen erforderlichen Parametern
                const geoData = await this.geometryTool.calculate("PLATONIC_SOLIDS", "tetrahedron", { size: 5 });
                const response = `\n[ERGEBNIS]: ${JSON.stringify(geoData)}\n`;
                onChunk(response);
                return { output: response, success: true, agentName: "ORION" };
            }
            catch (err) {
                onChunk(`\n[!] Geometrie-Fehler: ${err.message}\n`);
                return { output: "", success: false, agentName: "ORION" };
            }
        }
        // 3. Standard Flow & PlanAgent
        const context = request.agent === "PlanAgent"
            ? { ...request.sessionData, manifest: this.getCurrentManifest() }
            : request.sessionData;
        const result = await this.agentExecutor.execute(request.agent, { query: request.input, context });
        if (result && result.output)
            onChunk(result.output);
        return result;
    }
};
exports.OrionOrchestrator = OrionOrchestrator;
exports.OrionOrchestrator = OrionOrchestrator = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('Logger')),
    __param(1, (0, tsyringe_1.inject)('AgentExecutor')),
    __metadata("design:paramtypes", [Object, Object, GeometryTool_1.GeometryTool])
], OrionOrchestrator);
