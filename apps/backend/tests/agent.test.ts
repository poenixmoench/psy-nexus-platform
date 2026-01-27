import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { FrontendMeisterAgent } from '../src/agents/FrontendMeisterAgent';
import { GeometryService } from '../src/types/GeometryService';
import { Logger } from '../src/types/Logger';
import { AgentInput } from '../src/types/AgentExecutor';

// Mock-Implementierung für GeometryService
const mockGeometryService: jest.Mocked<GeometryService> = {
  storeGeometry: jest.fn(),
  loadGeometryByName: jest.fn(),
  loadGeometriesByTag: jest.fn(),
  searchGeometries: jest.fn(),
  updateGeometry: jest.fn(),
  deleteGeometry: jest.fn(),
};

// Mock-Implementierung für Logger
const mockLogger: jest.Mocked<Logger> = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('FrontendMeisterAgent', () => {
  let agent: FrontendMeisterAgent;

  beforeEach(() => {
    agent = new FrontendMeisterAgent(mockGeometryService, mockLogger);
  });

  it('should execute successfully for a query containing "Geometrie"', async () => {
    const input: AgentInput = { query: 'Generiere etwas mit Geometrie.' };
    const mockGeometries = [{ name: 'Sri Yantra', description: 'Sacred Geometry' }];
    (mockGeometryService.loadGeometriesByTag as jest.Mock).mockResolvedValue(mockGeometries);

    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Generiertes SVG');
    expect(mockGeometryService.loadGeometriesByTag).toHaveBeenCalledWith('sacred');
    expect(mockLogger.info).toHaveBeenCalledWith('FrontendMeisterAgent', 'execute', 'Geladene Geometrien: 1');
  });

  it('should handle errors when loading geometry fails', async () => {
    const input: AgentInput = { query: 'Generiere etwas mit Geometrie.' };
    const mockError = new Error('Failed to load geometry');
    (mockGeometryService.loadGeometriesByTag as jest.Mock).mockRejectedValue(mockError);

    const result = await agent.execute(input);

    expect(result.success).toBe(false);
    expect(result.error).toBe(mockError.message);
    expect(mockLogger.error).toHaveBeenCalledWith('FrontendMeisterAgent', 'execute', 'Fehler beim Laden der Geometrie:', mockError);
  });

  it('should execute successfully for a query not containing "Geometrie"', async () => {
    const input: AgentInput = { query: 'Erstelle eine Webseite.' };

    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Erstelle eine Webseite');
  });
});
