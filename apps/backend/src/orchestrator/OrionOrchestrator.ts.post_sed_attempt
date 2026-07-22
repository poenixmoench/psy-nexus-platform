import { KnownAgentType } from "@shared/types/AgentTypes";
import { injectable, inject } from 'tsyringe';
import { z } from 'zod';
import { Logger } from "../types/Logger";
import { AgentExecutor, AgentInput, AgentResult } from "../types/AgentExecutor";
import { GeometryTool } from '../tools/GeometryTool';
import { AgentName } from "../types/AgentTypes";
import * as fs from 'fs/promises';
import * as path from 'path';

const DOC_ANALYSIS_SCHEMA = z.object({
  analysis: z.object({
    primaryDomain: z.string(),
    entities: z.array(z.string()),
    seoElements: z.object({
      headings: z.record(z.string(), z.array(z.string())),
      missingCritical: z.array(z.string())
    }),
    potentialIntent: z.string(),
    targetAudienceClues: z.array(z.string())
  }),
  recommendations: z.object({
    jsonLdProposal: z.string(),
    structuralSuggestions: z.array(z.string())
  })
});

interface ProjectManifest {
  projectName: string;
  globalStyle: { theme: string; colors: string[]; fonts: string[] };
  pages: Array<{ name: string; url: string; status: string }>;
  lastMilestone: string;
  updatedAt: string;
}

@injectable()
export class OrionOrchestrator {
  private currentManifest: ProjectManifest | null = null;
  private readonly VOLUME_BASE = '/mnt/HC_Volume_103847079/psy-nexus-library';
  private readonly MANIFEST_PATH = path.join(this.VOLUME_BASE, 'manifests/psy-nexus-main.json');

  constructor(
    @inject('Logger') private logger: Logger,
    @inject('AgentExecutor') private agentExecutor: AgentExecutor,
    private geometryTool: GeometryTool
  ) {}

  public async initialize(): Promise<void> {
    await this.ensureVolumePaths();
    try {
      await this.loadManifestFromVolume();
    } catch (err) {
      this.currentManifest = this.getDefaultManifest();
    }
  }

  private async ensureVolumePaths() {
    const dirs = [path.dirname(this.MANIFEST_PATH), path.join(this.VOLUME_BASE, 'code-snapshots')];
    for (const d of dirs) await fs.mkdir(d, { recursive: true });
  }

  private async loadManifestFromVolume() {
    const data = await fs.readFile(this.MANIFEST_PATH, 'utf-8');
    this.currentManifest = JSON.parse(data);
  }

  private getDefaultManifest(): ProjectManifest {
    return {
      projectName: "Psy-Nexus",
      globalStyle: { theme: "Klarheit & Fokus", colors: [], fonts: [] },
      pages: [],
      lastMilestone: "Initialisierung",
      updatedAt: new Date().toISOString()
    };
  }

  public getCurrentManifest(): ProjectManifest {
    return this.currentManifest || this.getDefaultManifest();
  }

  private validateAgentOutput<T>(output: string, schema: z.ZodSchema<T>): T {
    let rawJson = output || "";
    const markdownMatch = rawJson.match(/```json\s*\n([\s\S]*?)\n\s*```/);
    if (markdownMatch) rawJson = markdownMatch[1].trim();
    const parsed = JSON.parse(rawJson.match(/\{[\s\S]*\}/)?.[0] || rawJson);
    return schema.parse(parsed);
  }

  public async processRequestStreaming(request: any, onChunk: (chunk: string) => void): Promise<AgentResult> {
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
        return { output: response, success: true, agentName: "ORION" as any };
      } catch (err: any) {
        onChunk(`\n[!] Geometrie-Fehler: ${err.message}\n`);
        return { output: "", success: false, agentName: "ORION" as any };
      }
    }

    // 3. Standard Flow & PlanAgent
    const context = request.agent === "PlanAgent" 
      ? { ...request.sessionData, manifest: this.getCurrentManifest() }
      : request.sessionData;

    const result = await this.agentExecutor.execute(request.agent, { query: request.input, context });
    if (result && result.output) onChunk(result.output);
    return result;
  }
}
