const fs = require('fs');
const path = require('path');
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.js') && f !== 'index.js');
files.forEach(file => {
  const name = path.basename(file, '.js');
  module.exports[name] = require('./' + file);
});
