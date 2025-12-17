/**
 * Stellt sicher, dass Ollama-Anfragen sequenziell (seriell) abgearbeitet werden.
 * Dies ist kritisch, um Ressourcen-Kollisionen bei der LLM-Inferenz zu verhindern.
 */
export class OllamaRequestQueue {
    constructor() {
        Object.defineProperty(this, "isProcessing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    /**
     * Fügt einen Job zur Warteschlange hinzu.
     * @param job Die asynchrone Funktion, die die Ollama-Anfrage ausführt.
     */
    enqueue(job) {
        return new Promise((resolve, reject) => {
            const jobWrapper = () => job().then(resolve).catch(reject);
            this.queue.push(jobWrapper);
            this.processNext();
        });
    }
    processNext() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }
        this.isProcessing = true;
        const nextJob = this.queue.shift();
        if (nextJob) {
            console.log(`[Ollama Queue] Starte nächsten Job. Verbleibend: ${this.queue.length}`);
            nextJob().finally(() => {
                this.isProcessing = false;
                // Starte den nächsten Job sofort
                this.processNext();
            });
        }
    }
}
// Exportiere eine Singleton-Instanz der Warteschlange
export const ollamaQueue = new OllamaRequestQueue();
//# sourceMappingURL=ollama-queue.js.map