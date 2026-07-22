const fs = require('fs');
const path = require('path');
const projectRoot = '/root/psy-nexus-platform/apps/backend';
const prismaSrc = path.join(projectRoot, 'src/generated/prisma');
const prismaDist = path.join(projectRoot, 'dist/generated/prisma');
const prismaService = path.join(projectRoot, 'dist/db/PrismaService.js');

console.log('--- 🛡️ Finalisiere Build-Artefakte ---');
if (fs.existsSync(prismaSrc)) {
    if (!fs.existsSync(prismaDist)) fs.mkdirSync(prismaDist, { recursive: true });
    fs.cpSync(prismaSrc, prismaDist, { recursive: true });
    console.log('✅ Prisma-Client kopiert.');
}
if (fs.existsSync(prismaService)) {
    let content = fs.readFileSync(prismaService, 'utf8');
    const patched = content.replace(/super\(.*?\);/g, 'super();');
    fs.writeFileSync(prismaService, patched);
    console.log('✅ PrismaService stabilisiert.');
}
