-- Erstelle den postgres User (falls nicht vorhanden)
CREATE USER IF NOT EXISTS postgres WITH SUPERUSER CREATEDB CREATEROLE ENCRYPTED PASSWORD 'postgres';

-- Erstelle die Datenbank
CREATE DATABASE IF NOT EXISTS psy_nexus_db OWNER postgres;

-- Verbinde zur neuen DB und erstelle Schema
\c psy_nexus_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS orchestration_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_goal TEXT NOT NULL,
    final_output TEXT,
    status VARCHAR(50) NOT NULL,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_outputs (
    output_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES orchestration_runs(run_id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL,
    output_content TEXT,
    step_order INTEGER NOT NULL,
    file_format VARCHAR(50) DEFAULT 'text/plain',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES orchestration_runs(run_id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runs_created_at ON orchestration_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outputs_run_id ON agent_outputs(run_id);
CREATE INDEX IF NOT EXISTS idx_conversations_run_id ON agent_conversations(run_id);
