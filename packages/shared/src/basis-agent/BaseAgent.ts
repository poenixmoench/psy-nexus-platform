import { EventEmitter2 } from 'eventemitter2';

export abstract class BaseAgent {
  protected bus: EventEmitter2;

  constructor(public readonly name: string = 'UNKNOWN_AGENT') {
    this.bus = (global as any).NEXUS_BUS;
    if (!this.bus) {
      this.bus = new EventEmitter2({ wildcard: true });
    }
  }

  // Diese Methode muss jeder Agent implementieren
  abstract processDelta(input: any): Promise<any>;

  protected emitTag(tag: any) {
    this.bus.emit('tag.emitted', {
      ...tag,
      sourceAgent: this.name,
      timestamp: Date.now()
    });
  }
}
