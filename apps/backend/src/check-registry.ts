import 'reflect-metadata';
import { container } from 'tsyringe';
import { GeometryTool } from './tools/GeometryTool';

// Logger Mock
container.register('Logger', { useValue: console });

try {
    const tool = container.resolve(GeometryTool);
    const manifest = tool.getManifest();
    console.log("\n--- REGISTRIERTE FORMELN ---");
    if (manifest[0].forms.length === 0) {
        console.log("❌ REGISTRY IST LEER!");
    } else {
        manifest[0].forms.forEach(f => console.log(`📍 ${f}`));
    }
    console.log("---------------------------\n");
} catch (e) {
    console.error("Fehler beim Zugriff auf das Tool:", e.message);
}
