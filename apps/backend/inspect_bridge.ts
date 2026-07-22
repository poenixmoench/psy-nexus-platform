import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspect() {
  console.log("🔍 Rufe letzte 3 Workflows aus der Datenbank...\n");
  
  const workflows = await prisma.workflows.findMany({
    take: 3,
    orderBy: { updated_at: 'desc' },
    select: {
      id: true,
      status: true,
      metadata: true,
      updated_at: true
    }
  });

  workflows.forEach((wf, i) => {
    const meta = wf.metadata as any || {};
    const hasResult = meta.last_result ? "✅ VORHANDEN" : "❌ LEER";
    const agent = meta.targetAgent || meta.agent || "UNBEKANNT";
    
    console.log(`[${i+1}] Workflow-ID: ${wf.id}`);
    console.log(`    Agent:  ${agent}`);
    console.log(`    Status: ${wf.status}`);
    console.log(`    Daten:  ${hasResult}`);
    
    if (meta.last_result) {
      const preview = JSON.stringify(meta.last_result).substring(0, 120);
      console.log(`    Inhalt: ${preview}...`);
    }
    console.log('---------------------------------------------------------');
  });
  
  await prisma.$disconnect();
}
inspect().catch(console.error);
