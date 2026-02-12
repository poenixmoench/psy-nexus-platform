import { EventEmitter2 } from 'eventemitter2';
import { container, delay, inject, injectable } from 'tsyringe';

export const eventEmitter = new EventEmitter2({
  wildcard: true,
  delimiter: '.',
  maxListeners: 20
});

// Registrierung als Singleton im Container
container.registerInstance(EventEmitter2, eventEmitter);
