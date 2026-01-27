export interface TaskRow {
  id: string
  user_id: string
  agent_type: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  initial_prompt: string
  current_step: number
  progress_percentage: number
  created_at: Date
  updated_at: Date
}

export const CREATE_TASK_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('CodeAnalyzerAgent','RefactoringAgent','TestGeneratorAgent','DocumentationAgent','SecurityAuditAgent')), status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED')), initial_prompt TEXT NOT NULL, current_step INTEGER DEFAULT 1 CHECK (current_step >= 1), progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100), created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()); CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql; CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); CREATE INDEX idx_tasks_user_id ON tasks(user_id); CREATE INDEX idx_tasks_status ON tasks(status); CREATE INDEX idx_tasks_agent_type ON tasks(agent_type); CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);`

export const CREATE_TASK_RESULTS_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS task_results (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, step_number INTEGER NOT NULL CHECK (step_number >= 1), agent_output TEXT NOT NULL, execution_time_ms INTEGER NOT NULL CHECK (execution_time_ms >= 0), status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS','ERROR','PARTIAL')), error_message TEXT, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()); CREATE INDEX idx_task_results_task_id ON task_results(task_id); CREATE INDEX idx_task_results_step ON task_results(task_id,step_number); CREATE INDEX idx_task_results_created_at ON task_results(created_at DESC);`

export const INSERT_TASK = `INSERT INTO tasks (user_id, agent_type, initial_prompt) VALUES ($1, $2, $3) RETURNING *;`
export const GET_TASK = `SELECT * FROM tasks WHERE id = $1;`
export const UPDATE_TASK_STATUS = `UPDATE tasks SET status = $2, current_step = $3, progress_percentage = $4, updated_at = NOW() WHERE id = $1 RETURNING *;`
export const GET_TASKS_BY_USER = `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;`
export const GET_PENDING_TASKS = `SELECT * FROM tasks WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT $1;`
export const GET_RUNNING_TASKS = `SELECT * FROM tasks WHERE status = 'RUNNING' ORDER BY created_at ASC;`
export const CANCEL_TASK = `UPDATE tasks SET status = 'CANCELLED' WHERE id = $1 AND status IN ('PENDING', 'RUNNING') RETURNING *;`
export const INSERT_TASK_RESULT = `INSERT INTO task_results (task_id, step_number, agent_output, execution_time_ms, status, error_message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`
export const GET_TASK_RESULTS = `SELECT * FROM task_results WHERE task_id = $1 ORDER BY step_number ASC;`
export const GET_LATEST_TASK_RESULT = `SELECT * FROM task_results WHERE task_id = $1 ORDER BY step_number DESC LIMIT 1;`
