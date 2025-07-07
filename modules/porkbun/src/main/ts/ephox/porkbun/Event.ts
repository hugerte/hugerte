export type EventHandler<T> = (event: T) => void;

export interface Bindable<T> {
  bind: (handler: EventHandler<T>) => void;
  unbind: (handler: EventHandler<T>) => void;
}

export interface Event extends Bindable<any> {
  trigger: (...values: any[]) => void;
}

export const Event = (fields: string[]): Event => {
  let handlers: EventHandler<any>[] = [];

  const bind = (handler: EventHandler<any>) => {
    if (handler === undefined) {
      throw new Error('Event bind error: undefined handler');
    }
    handlers.push(handler);
  };

  const unbind = (handler: EventHandler<any>) => {
    // This is quite a bit slower than handlers.splice() but we hate mutation. TODO
    // Unbind isn't used very often so it should be ok.
    handlers = handlers.filter((h) => {
      return h !== handler;
    });
  };

  const trigger = <T> (...args: T[]) => {
    const event: Record<string, T> = {};
    fields.forEach((name, i) => {
      event[name] = args[i];
    });
    handlers.forEach((handler) => {
      handler(event);
    });
  };

  return {
    bind,
    unbind,
    trigger
  };
};
