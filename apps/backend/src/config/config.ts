export interface Config {
  mongodb: {
    uri: string;
    dbName: string;
    collectionName: string;
  };
  server: {
    port: number;
    host: string;
    corsOrigin: string;
  };
  llm: {
    provider: string;
    apiKey: string;
  };
  security: {
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    apiKey?: string; // Optional, da es aus der Umgebung kommt
  };
}

const config: Config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'psy_nexus_db',
    collectionName: process.env.MONGODB_COLLECTION_NAME || 'sacred_geometries',
  },
  server: {
    port: parseInt(process.env.SERVER_PORT || '3000', 10),
    host: process.env.SERVER_HOST || 'localhost',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    apiKey: process.env.LLM_API_KEY || '',
  },
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 Minuten
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 Anfragen
    apiKey: process.env.API_KEY, // Lesen aus Umgebungsvariable
  },
};

// Validierung der Konfiguration
if (!config.security.apiKey) {
  console.warn("WARNING: Kein API-Key in der Konfiguration gefunden (env: API_KEY). Authentifizierung wird fehlschlagen.");
}

export default config;
