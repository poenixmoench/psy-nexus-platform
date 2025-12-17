type Job<T> = () => Promise<T>;
/**
 * Stellt sicher, dass Ollama-Anfragen sequenziell (seriell) abgearbeitet werden.
 * Dies ist kritisch, um Ressourcen-Kollisionen bei der LLM-Inferenz zu verhindern.
 */
export declare class OllamaRequestQueue {
    private isProcessing;
    private queue;
    /**
     * Fügt einen Job zur Warteschlange hinzu.
     * @param job Die asynchrone Funktion, die die Ollama-Anfrage ausführt.
     */
    enqueue<T>(job: Job<T>): Promise<T>;
    private processNext;
}
export declare const ollamaQueue: OllamaRequestQueue;
export {};
//# sourceMappingURL=ollama-queue.d.ts.map