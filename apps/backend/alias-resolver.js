const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAlias('@shared/geometry', path.join(__dirname, '../../libs/shared/geometry'));
