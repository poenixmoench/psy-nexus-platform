"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAgentRequest = handleAgentRequest;
const tsyringe_1 = require("tsyringe");
const OrionOrchestrator_1 = require("../orchestrator/OrionOrchestrator");
async function handleAgentRequest(req, res) {
    const startTime = Date.now();
    try {
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        });
        const { agent, prompt, sessionData = {} } = req.body || {};
        if (!prompt) {
            res.write(`data: ${JSON.stringify({ error: "Kein Prompt empfangen" })}\n\n`);
            return res.end();
        }
        const orchestrator = tsyringe_1.container.resolve(OrionOrchestrator_1.OrionOrchestrator);
        res.write(`data: ${JSON.stringify({ type: 'start', agent: agent || 'ORION', elapsed: 0 })}\n\n`);
        await orchestrator.processRequestStreaming({
            agent: agent || 'ORION',
            input: prompt,
            sessionData: sessionData || { history: [] }
        }, (chunk) => {
            if (!res.writableEnded) {
                res.write(`data: ${JSON.stringify({
                    type: 'chunk',
                    response: chunk,
                    elapsed: Date.now() - startTime
                })}\n\n`);
            }
        });
        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ type: 'complete', done: true, elapsed: Date.now() - startTime })}\n\n`);
        }
    }
    catch (error) {
        console.error("Orchestrator Error:", error);
        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ error: "Fehler", message: error.message })}\n\n`);
        }
    }
    finally {
        if (!res.writableEnded)
            res.end();
    }
}
