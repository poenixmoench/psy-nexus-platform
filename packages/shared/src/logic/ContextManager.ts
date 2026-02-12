import { StigmergyTag } from '../types/AgentTypes';

export class ContextManager {
  private static deltaCache = new Map<string, { tags: StigmergyTag[]; timestamp: number }>();
  private static readonly RELEVANCE_WINDOW = 2 * 60 * 60 * 1000;
  private static readonly MAX_TAGS = 40; // Hard Limit gegen Token-Explosion

  static calculateDelta(allTags: StigmergyTag[], agentNamespace: string): StigmergyTag[] {
    const NOW = Date.now();
    
    // 1. Cache-Key generieren (Namespace + Tag-Anzahl + Letzter Zeitstempel)
    const lastTagTs = allTags.length > 0 ? allTags[allTags.length - 1].timestamp : 0;
    const cacheKey = `${agentNamespace}_${allTags.length}_${lastTagTs}`;

    const cached = this.deltaCache.get(cacheKey);
    if (cached && (NOW - cached.timestamp) < 2000) { // 2 Sek. Cache-Gültigkeit
      return cached.tags;
    }

    // 2. Filter-Logik (PerformCalculation)
    const filtered = allTags.filter(tag => {
      if (tag.priority === 'HIGH') return true;
      if (tag.namespace === agentNamespace) return true;
      return (NOW - tag.timestamp) < this.RELEVANCE_WINDOW;
    });

    // 3. Sortierung und Grenzwertprüfung (Slice)
    const result = filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, this.MAX_TAGS);

    // 4. Monitoring-Output
    console.log(`[ContextManager] Optimization: ${allTags.length} -> ${result.length} Tags (${agentNamespace})`);

    // 5. Cache befüllen
    this.deltaCache.set(cacheKey, { tags: result, timestamp: NOW });
    
    // Cache Cleanup (verhindert Memory Leak bei Map)
    if (this.deltaCache.size > 100) this.deltaCache.clear();

    return result;
  }
}
