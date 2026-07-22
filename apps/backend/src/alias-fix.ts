const moduleAlias = require('module-alias');
const path = require('path');
const projectRoot = '/root/psy-nexus-platform';

moduleAlias.addAliases({
  '@shared': path.join(projectRoot, 'packages/shared/src'),
  '@prisma-generated': path.join(projectRoot, 'apps/backend/dist/generated/prisma')
});
moduleAlias();
console.log('✅ [SENTINEL-V7.3] Absolute Pfad-Anker scharfgeschaltet.');
