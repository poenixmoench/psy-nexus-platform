import 'reflect-metadata';
import { container } from 'tsyringe';
import { EventEmitter2 } from 'eventemitter2';
import { BaseAgent } from '@shared/basis-agent/BaseAgent';
import { StigmergyService } from './services/StigmergyService';
import { v4 as uuidv4 } from 'uuid';

async function test() {
  const bus = new EventEmitter2();
  (BaseAgent as any).targetBus = bus;
  const stigmergy = container.resolve(StigmergyService);

  bus.on('tag.emitted', async (tag) => {
    console.log('📡 Puls empfangen, schreibe in DB...');
    await stigmergy.saveTags([tag]);
    console.log('✅ Test-Tag gespeichert!');
    process.exit(0);
  });

  const testTag = {
    id: uuidv4(),
    sourceAgent: 'DEBUG_PROBE',
    timestamp: Date.now(),
    payload: { type: 'INFO', data: { msg: 'Nexus lebt!' } }
  };

  bus.emit('tag.emitted', testTag);
}
test();
