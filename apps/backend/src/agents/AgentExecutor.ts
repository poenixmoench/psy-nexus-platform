import { injectable, injectAll, container } from 'tsyringe';
import { BaseAgent } from '@shared/basis-agent/BaseAgent';
import { AgentResult } from '@shared/types/AgentTypes';

@injectable()
export class AgentExecutor {
  // ✅ FIX: 4. Argument 'previousOutput' hinzugefügt
  public async execute(agentName: string, input: string, sessionData: any = {}, previousOutput: any = null, onToken?: (token: string) => void): Promise<AgentResult> {
    console.log(`🤖 [EXECUTOR] Suche Agent: ${agentName}`);

    try {
      // Wir holen den Agenten direkt aus dem Container via Token
      let resolvedToken = agentName;
      if (!resolvedToken.endsWith("_AGENT")) resolvedToken = `${resolvedToken}_AGENT`;
      const agentInstance = container.resolve(resolvedToken as any);

      if (!agentInstance || typeof (agentInstance as any).processDelta !== 'function') {
        throw new Error(`Agent ${agentName} hat keine processDelta Methode!`);
      }

      console.log(`✅ [EXECUTOR] Agent Instanz gefunden. Starte Prozess...`);

      // ✅ FIX: Aufruf mit Cast auf any, um TS2339 zu verhindern
      // Wir verpacken den Input so, wie BaseAgent es erwartet UND injizieren previousOutput
      const payload = {
        query: input,
        previousOutput: previousOutput,
        onToken: onToken,
        context: {
          sessionData: sessionData || {},
          history: []
        }
      };

      return await (agentInstance as any).processDelta(payload);

    } catch (error: any) {
      console.error(`💥 [EXECUTOR] Fehler: ${error.message}`);
      return {
        success: false,
        output: `Executor Error: ${error.message}`,
        agentName: agentName as any,
        newTags: []
      };
    }
  }

  public async executeStream(agentName: string, input: string, onToken: (token: string) => void, previousOutput: any = null): Promise<string> {
    // Rufe execute auf und reiche den onToken-Callback direkt durch
    const result: any = await this.execute(agentName, input, {}, previousOutput, onToken);

    // Fallback für den finalen Return-Wert (falls der Agent nicht streamt)
    const candidate =
      (result && typeof result.output === 'string' && result.output) ||
      (result && typeof result.message === 'string' && result.message) ||
      (result && typeof result.content === 'string' && result.content) ||
      (typeof result === 'string' ? result : '');
    return typeof candidate === 'string' ? candidate : JSON.stringify(candidate);
  }
}
