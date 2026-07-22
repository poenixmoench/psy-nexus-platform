import "./alias-fix";
import { container } from 'tsyringe';
import { StigmergyService } from './src/services/StigmergyService';
import { getPool } from './src/services/database';
import MemoryService from './src/services/MemoryService';

async function test() {
  console.log("🚀 Starte typsicheren Synapsen-Test...");
  MemoryService.init(getPool());
  const stigmergy = container.resolve(StigmergyService);
  
  const testTag = {
    id: "test-" + Date.now(),
    sourceAgent: "ALPHA_TESTER",
    timestamp: Date.now(),
    payload: { 
      type: "THOUGHT", // MUSS vorhanden sein
      data: { message: "System-Check: Die typsicheren Synapsen feuern!" } // MUSS in data liegen
    }
  };

  try {
    await stigmergy.saveTags([testTag as any]);
    console.log("✅ Tag erfolgreich direkt in DB geschrieben!");
  } catch (err: any) {
    console.error("❌ DB-Schreibfehler:", err.message);
  }
  process.exit(0);
}
test();
