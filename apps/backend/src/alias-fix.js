const moduleAlias = require('module-alias');
const path = require('path');
const projectRoot = '/root/psy-nexus-platform';

moduleAlias.addAliases({
  '@shared': path.join(projectRoot, 'packages/shared/dist'),
  'libs/shared': path.join(projectRoot, 'packages/shared/dist')
});
moduleAlias();
console.log('✅ [SENTINEL-LINK] Aliase für Agenten-Infrastruktur aktiv.');
