type Job<T> = () => Promise<T>;

/**
 * Stellt sicher, dass Ollama-Anfragen sequenziell (seriell) abgearbeitet werden.
 * Dies ist kritisch, um Ressourcen-Kollisionen bei der LLM-Inferenz zu verhindern.
 */
export class OllamaRequestQueue {
    private isProcessing = false;
    private queue: Job<any>[] = [];

    /**
     * Fügt einen Job zur Warteschlange hinzu.
     * @param job Die asynchrone Funktion, die die Ollama-Anfrage ausführt.
     */
    public enqueue<T>(job: Job<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const jobWrapper = () => job().then(resolve).catch(reject);
            this.queue.push(jobWrapper);
            this.processNext();
        });
    }

    private processNext(): void {
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
