import 'reflect-metadata';
import { container } from 'tsyringe';
import { StigmergyService } from './services/StigmergyService';

async function runTest() {
  console.log("🛠️ Starte validierten DB-Schreibtest...");
  try {
    const stig = container.resolve(StigmergyService);
    const result = await stig.createTag({
      sourceAgent: 'PLAN_AGENT' as any,
      namespace: 'global',
      priority: 'HIGH',
      payload: { 
        type: 'STATUS', 
        data: { message: 'MANUAL_INJECTION_SUCCESSFUL', system: 'DIAGNOSTIC' },
        reason: 'Testing database connection'
      }
    });
    console.log("✅ DB-SCHREIBTEST ERFOLGREICH! Tag-ID:", result.id);
    process.exit(0);
  } catch (err) {
    console.error("❌ DB-SCHREIBTEST FEHLGESCHLAGEN:", err);
    process.exit(1);
  }
}
runTest();
