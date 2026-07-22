const profiles = require('./agent-profiles');
const data = profiles.AGENT_PROFILES || {};

// Skalierbares Mapping: Wir bedienen beide Namensstile
const mappedData = { ...data };

// Mapping-Tabelle für die Top-Agenten
const aliases = {
  'OrionAgent': 'ORION_AGENT',
  'PlanAgent': 'PLAN_AGENT'
};

Object.entries(aliases).forEach(([oldKey, newKey]) => {
  if (data[newKey]) {
    mappedData[oldKey] = data[newKey];
  }
});

module.exports = {
  ...mappedData,
  AGENT_PROFILES: mappedData,
  agentProfiles: mappedData,
  'agent-profiles': mappedData
};
