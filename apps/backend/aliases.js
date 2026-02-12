const moduleAlias = require('module-alias');
const path = require('path');
const ROOT = '/root/psy-nexus-platform';

moduleAlias.addAliases({
  '@shared/config': path.join(ROOT, 'packages/shared/src/config'),
  // Wir mappen den Namespace DIREKT auf die existierende Engine-Datei
  '@shared/geometry': path.join(ROOT, 'apps/backend/dist/shared-geometry/geometry.engine.js')
});

console.log('✅ Geometrie-Alias chirurgisch auf geometry.engine.js fixiert.');
