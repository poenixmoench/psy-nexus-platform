async function testModel(modelName) {
    const prompt = "Erkläre kurz die Relativitätstheorie.";
    console.log(`🚀 Starte Test für Modell: ${modelName}...`);

    const start = Date.now();
    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify({
            model: modelName,
            prompt: prompt,
            stream: false
        })
    });

    const data = await response.json();

    const loadTime = (data.load_duration / 1e9).toFixed(2);
    const generationTime = (data.total_duration / 1e9).toFixed(2);
    const tps = (data.eval_count / (data.eval_duration / 1e9)).toFixed(2);

    console.log(`\n--- 📊 ${modelName.toUpperCase()} ---`);
    console.log(`⏱️  Ladezeit: ${loadTime}s`);
    console.log(`⏱️  Gesamtzeit: ${generationTime}s`);
    console.log(`⚡ Exakte TPS: ${tps}`);
    console.log(`🧠 Tokens: ${data.eval_count}`);
    console.log(`------------------------\n`);

    return { tps: parseFloat(tps), loadTime: parseFloat(loadTime) };
}

async function compareModels() {
    console.log("🔄 Starte Modell-Vergleich...\n");
    
    const results = {};
    
    // Teste beide Modelle
    results.qwen25 = await testModel('qwen2.5:14b');
    results.coder = await testModel('qwen2.5-coder:14b');
    
    // Vergleichsansicht
    console.log("🏆 VERGLEICHSERGEBNISSE:");
    console.log(`Qwen2.5 vs Coder TPS: ${results.qwen25.tps.toFixed(2)} vs ${results.coder.tps.toFixed(2)}`);
    console.log(`Ladezeit: ${results.qwen25.loadTime.toFixed(2)}s vs ${results.coder.loadTime.toFixed(2)}s`);
    
    const winner = results.qwen25.tps > results.coder.tps ? 'Qwen2.5' : 'Coder';
    console.log(`🏆 Schnelleres Modell: ${winner} (${Math.abs(results.qwen25.tps - results.coder.tps).toFixed(2)} TPS Unterschied)`);
}

compareModels();
