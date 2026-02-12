const fs = require('fs');
const path = require('path');
const AGENT_DIR = path.join(__dirname, '../src/agents');
const AGENT_NAMES = ['OrionAgent', 'PlanAgent', 'DesignAlchemistAgent', 'FrontendMeisterAgent', 'BackendArchitectAgent', 'QaGuruAgent', 'OptimizerAgent', 'DokumentationAgent'];
const SHARED_CONFIG_IMPORT_PATH = '../../packages/shared/src/config/agent-profiles';

function ensureImportExists(content, importPath) {
  const importPattern = new RegExp(`import\\s+{[^}]*AGENT_PROFILES[^}]*}\\s+from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];`);
  if (!importPattern.test(content)) {
    return `import { AGENT_PROFILES } from '${importPath}';\n` + content;
  }
  return content;
}

function injectMetadataGetter(content, agentName) {
  if (content.includes('static get metadata()')) return content;
  const metadataGetter = `\n  static get metadata() {\n    return AGENT_PROFILES.${agentName};\n  }`;
  const classRegex = new RegExp(`(export class ${agentName}\\s*(?:extends\\s+[^{]*)?(?:implements\\s+[^{]*)?\\s*{)`, 'm');
  return classRegex.test(content) ? content.replace(classRegex, `$1${metadataGetter}`) : content;
}

AGENT_NAMES.forEach(agent => {
  const filePath = path.join(AGENT_DIR, `${agent}.ts`);
  if (!fs.existsSync(filePath)) return;
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = ensureImportExists(content, SHARED_CONFIG_IMPORT_PATH);
    content = injectMetadataGetter(content, agent);
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${agent} updated.`);
  } catch (e) { console.error(`❌ ${agent} failed:`, e.message); }
});
