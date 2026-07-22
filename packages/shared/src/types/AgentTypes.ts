export const KnownAgentTypeValues = [
  'ORION_AGENT',
  'PLAN_AGENT',
  'DESIGN_ALCHEMIST_AGENT',
  'FRONTEND_MEISTER_AGENT',
  'BACKEND_ARCHITEKT_AGENT',
  'QA_GURU_AGENT',
  'OPTIMIERER_AGENT',
  'DOKUMENTATION_AGENT'
] as const;

export type KnownAgentType = typeof KnownAgentTypeValues[number];

// Manifest-konforme RunStatus Typen für Phase 1
export type RunStatus = 
  | { type: 'PENDING' }
  | { type: 'IN_PROGRESS'; currentAgent: KnownAgentType }
  | { type: 'AWAITING_PLAN_APPROVAL'; planId: string }
  | { type: 'AWAITING_DESIGN_APPROVAL'; assetPreviewUrl: string }
  | { type: 'AWAITING_QA_APPROVAL'; testReportId: string }
  | { type: 'AWAITING_BACKEND_APPROVAL'; apiSpecId: string }
  | { type: 'AWAITING_FRONTEND_APPROVAL'; uiSpecId: string }
  | { type: 'AWAITING_OPTIMIZATION_APPROVAL'; reportId: string }
  | { type: 'AWAITING_DOCUMENTATION_APPROVAL'; docId: string }
  | { type: 'AWAITING_ORION_APPROVAL'; strategicDecisionId: string }
  | { type: 'SUCCESS'; finalArtifactPath: string }
  | { type: 'FAILED'; errorCode: string; reason: string };

export interface StigmergyPayload {
  type: 'TASK' | 'DATA' | 'KNOWLEDGE' | 'STATUS' | 'ERROR' | 'APPROVAL_REQUEST' | 'GEOMETRY_STRUCTURE' | 'GEOMETRY_STRUCTURE';
  data: Record<string, unknown>;
  reason?: string;
}

// Erweitertes StigmergyTag mit Namespace und Priority für die Delta-Logik
export interface StigmergyTag {
  id: string;
  sourceAgent: string;
  timestamp: number;
  payload: StigmergyPayload;
  ttl?: number;
  namespace?: string; // Zum Filtern nach Agenten-Bereich
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'; // Zum Filtern nach Wichtigkeit
}

export interface ContextDelta {
  previousHash: string;
  currentHash: string;
  diffContent?: string;
  activeTags: StigmergyTag[];
}

/**
 * Das universelle Eingabe-Format der Alpha-Flotte.
 */
export interface AgentInput {
  query: string;
  agentName: KnownAgentType;
  context: {
    delta: ContextDelta;       // Der aktuelle Delta-Zustand (siehe oben in der Datei)
    sessionData?: any;
    projectManifest?: any;
  };
  parameters?: Record<string, unknown>;
}

/**
 * Das standardisierte Ausgabe-Format für konsistente Workflow-Verarbeitung.
 */
export interface AgentResult {
  output: string;
  newTags: StigmergyTag[];
  success: boolean;
  agentName: KnownAgentType;
  error?: string;
}

export interface IExtendedGeometricForm {
  id?: string;
  name: string;
  type?: string;
  vortexPoints?: number[];
  rodinVector?: [number, number, number];
  faces?: number;
  formula?: string;
  description?: string;
  data?: any;
  [key: string]: any;
}

export interface IGeometryEngine {
  getForm(id: string): IExtendedGeometricForm | undefined;
  getAllForms(): IExtendedGeometricForm[];
  PLATONIC_SOLIDS?: any;
}
