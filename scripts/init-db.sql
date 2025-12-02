-- =========================================================================
-- PSY-NEXUS Database Initialization Script
-- =========================================================================

-- Erstelle Orchestrations-Tabelle
CREATE TABLE IF NOT EXISTS orchestrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_goal TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  final_output TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Agent-Outputs Tabelle
CREATE TABLE IF NOT EXISTS agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orchestration_id UUID NOT NULL REFERENCES orchestrations(id) ON DELETE CASCADE,
  agent_name VARCHAR(100) NOT NULL,
  output TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Indexes für Performance
CREATE INDEX idx_orchestrations_status ON orchestrations(status);
CREATE INDEX idx_orchestrations_created_at ON orchestrations(created_at DESC);
CREATE INDEX idx_agent_outputs_orchestration ON agent_outputs(orchestration_id);

-- Erstelle Views für API-Queries
CREATE OR REPLACE VIEW orchestration_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'SUCCESS') as successful,
  COUNT(*) FILTER (WHERE status = 'FAILED') as failed,
  COUNT(*) FILTER (WHERE status IN ('PENDING', 'IN_PROGRESS')) as in_progress,
  COUNT(*) as total,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000)::INTEGER as avg_duration_ms
FROM orchestrations;

-- Einfügen von Test-Daten (optional)
INSERT INTO orchestrations (user_goal, status, final_output, duration_ms)
VALUES 
  ('Test Goal 1', 'SUCCESS', 'Output 1', 1234),
  ('Test Goal 2', 'FAILED', 'Error occurred', 5678),
  ('Test Goal 3', 'IN_PROGRESS', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Gib Feedback
SELECT 'Database initialization completed successfully!' as status;
