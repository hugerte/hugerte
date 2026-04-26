
import { AlloyEventHandler, EventRunHandler } from '../api/events/AlloyEvents';
import { EventFormat, SimulatedEvent } from '../events/SimulatedEvent';

const defaultEventHandler = {
  can: (() => true as const),
  abort: (() => false as const),
  run: () => {}
};

const nu = <T extends EventFormat>(parts: Partial<AlloyEventHandler<T>>): AlloyEventHandler<T> => {
  if (!(Object.prototype.hasOwnProperty.call(parts, 'can') && (parts)['can'] != null) && !(Object.prototype.hasOwnProperty.call(parts, 'abort') && (parts)['abort'] != null) && !(Object.prototype.hasOwnProperty.call(parts, 'run') && (parts)['run'] != null)) {
    throw new Error(
      'EventHandler defined by: ' + JSON.stringify(parts, null, 2) + ' does not have can, abort, or run!'
    );
  }
  return {
    ...defaultEventHandler,
    ...parts
  };
};

const all = <T extends EventFormat>(handlers: Array<AlloyEventHandler<T>>, f: (handler: AlloyEventHandler<T>) => any) => (...args: any[]) =>
  (handlers).reduce((acc, handler) => acc && f(handler).apply(undefined, args), true);

const any = <T extends EventFormat>(handlers: Array<AlloyEventHandler<T>>, f: (handler: AlloyEventHandler<T>) => any) => (...args: any[]) =>
  (handlers).reduce((acc, handler) => acc || f(handler).apply(undefined, args), false);

const read = <T extends EventFormat>(handler: (() => SimulatedEvent<T>) | AlloyEventHandler<T>): AlloyEventHandler<T> =>
  typeof (handler) === 'function' ? {
    can: (() => true as const),
    abort: (() => false as const),
    run: handler
  } : handler;

const fuse = <T extends EventFormat>(handlers: Array<AlloyEventHandler<T>>): AlloyEventHandler<T> => {
  const can = all(handlers, (handler) => handler.can);

  const abort = any(handlers, (handler) => handler.abort);

  const run = (...args: Parameters<EventRunHandler<T>>) => {
    (handlers).forEach((handler) => {
      // ASSUMPTION: Return value is unimportant.
      handler.run.apply(undefined, args);
    });
  };

  return {
    can,
    abort,
    run
  };
};

export {
  read,
  fuse,
  nu
};
