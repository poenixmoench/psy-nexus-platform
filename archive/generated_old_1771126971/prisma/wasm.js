
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.19.1
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.19.1",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AgentsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  status: 'status',
  type: 'type',
  capabilities: 'capabilities',
  last_active: 'last_active'
};

exports.Prisma.Agent_messagesScalarFieldEnum = {
  id: 'id',
  session_id: 'session_id',
  role: 'role',
  content: 'content',
  tokens_used: 'tokens_used',
  created_at: 'created_at'
};

exports.Prisma.Agent_metricsScalarFieldEnum = {
  id: 'id',
  agent_id: 'agent_id',
  workflow_id: 'workflow_id',
  workflow_step_id: 'workflow_step_id',
  sequence_number: 'sequence_number',
  phase_number: 'phase_number',
  execution_time_ms: 'execution_time_ms',
  input_tokens: 'input_tokens',
  output_tokens: 'output_tokens',
  cost_cents: 'cost_cents',
  success_rate: 'success_rate',
  retry_count: 'retry_count',
  memory_used_mb: 'memory_used_mb',
  cpu_time_ms: 'cpu_time_ms',
  had_error: 'had_error',
  error_type: 'error_type',
  created_at: 'created_at'
};

exports.Prisma.Agent_sessionsScalarFieldEnum = {
  id: 'id',
  session_id: 'session_id',
  agent_id: 'agent_id',
  state: 'state',
  metadata: 'metadata',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ConversationsScalarFieldEnum = {
  id: 'id',
  workflow_id: 'workflow_id',
  workflow_step_id: 'workflow_step_id',
  role: 'role',
  agent_id: 'agent_id',
  content: 'content',
  content_type: 'content_type',
  is_streaming: 'is_streaming',
  streaming_complete: 'streaming_complete',
  metadata: 'metadata',
  created_at: 'created_at',
  updated_at: 'updated_at',
  sequence_number: 'sequence_number'
};

exports.Prisma.Deployment_recordsScalarFieldEnum = {
  id: 'id',
  workflow_id: 'workflow_id',
  deployment_platform: 'deployment_platform',
  deployment_url: 'deployment_url',
  deployment_status: 'deployment_status',
  deployed_artifacts: 'deployed_artifacts',
  build_time_ms: 'build_time_ms',
  build_log: 'build_log',
  previous_deployment_id: 'previous_deployment_id',
  created_at: 'created_at',
  deployed_at: 'deployed_at'
};

exports.Prisma.Project_artifactsScalarFieldEnum = {
  id: 'id',
  workflow_id: 'workflow_id',
  artifact_type: 'artifact_type',
  artifact_name: 'artifact_name',
  artifact_path: 'artifact_path',
  content: 'content',
  content_hash: 'content_hash',
  is_valid: 'is_valid',
  validation_errors: 'validation_errors',
  code_quality_score: 'code_quality_score',
  version_number: 'version_number',
  previous_version_id: 'previous_version_id',
  generated_by_phase: 'generated_by_phase',
  generated_by_agent: 'generated_by_agent',
  dependencies: 'dependencies',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Stigmergy_tagsScalarFieldEnum = {
  id: 'id',
  source_agent: 'source_agent',
  tag_type: 'tag_type',
  payload: 'payload',
  timestamp: 'timestamp',
  ttl: 'ttl'
};

exports.Prisma.TasksScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  agent_type: 'agent_type',
  status: 'status',
  initial_prompt: 'initial_prompt',
  current_step: 'current_step',
  progress_percentage: 'progress_percentage',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UsersScalarFieldEnum = {
  id: 'id',
  email: 'email',
  created_at: 'created_at'
};

exports.Prisma.Workflow_sessionsScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  session_token: 'session_token',
  session_name: 'session_name',
  current_workflow_id: 'current_workflow_id',
  created_at: 'created_at',
  last_activity: 'last_activity',
  expires_at: 'expires_at',
  is_active: 'is_active',
  metadata: 'metadata'
};

exports.Prisma.Workflow_stepsScalarFieldEnum = {
  id: 'id',
  workflow_id: 'workflow_id',
  sequence_number: 'sequence_number',
  phase_number: 'phase_number',
  phase_level: 'phase_level',
  agent_id: 'agent_id',
  agent_name: 'agent_name',
  status: 'status',
  attempt_count: 'attempt_count',
  max_retries: 'max_retries',
  input_data: 'input_data',
  output_data: 'output_data',
  code_language: 'code_language',
  code_content: 'code_content',
  code_quality_score: 'code_quality_score',
  started_at: 'started_at',
  completed_at: 'completed_at',
  duration_ms: 'duration_ms',
  error_message: 'error_message',
  error_details: 'error_details',
  previous_step_id: 'previous_step_id',
  depends_on_steps: 'depends_on_steps',
  validation_status: 'validation_status',
  validation_errors: 'validation_errors',
  metadata: 'metadata',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.WorkflowsScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  title: 'title',
  description: 'description',
  status: 'status',
  current_phase: 'current_phase',
  current_sequence: 'current_sequence',
  phases_completed: 'phases_completed',
  created_at: 'created_at',
  updated_at: 'updated_at',
  started_at: 'started_at',
  completed_at: 'completed_at',
  total_duration_ms: 'total_duration_ms',
  initial_requirements: 'initial_requirements',
  target_design: 'target_design',
  is_public: 'is_public',
  is_archived: 'is_archived',
  metadata: 'metadata'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Agents: 'Agents',
  agent_messages: 'agent_messages',
  agent_metrics: 'agent_metrics',
  agent_sessions: 'agent_sessions',
  conversations: 'conversations',
  deployment_records: 'deployment_records',
  project_artifacts: 'project_artifacts',
  stigmergy_tags: 'stigmergy_tags',
  tasks: 'tasks',
  users: 'users',
  workflow_sessions: 'workflow_sessions',
  workflow_steps: 'workflow_steps',
  workflows: 'workflows'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
