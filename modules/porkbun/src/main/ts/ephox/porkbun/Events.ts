
import { Bindable, Event } from './Event';

interface Events<T extends Record<string, Event>> {
  readonly registry: Record<keyof T, Bindable<any>>;
  readonly trigger: Record<keyof T, (...values: any[]) => void>;
}

/** :: {name : Event} -> Events */
const create = <T extends Record<string, Event>>(typeDefs: T): Events<T> => {
  const registry: Record<keyof T, Bindable<any>> = Object.fromEntries(Object.entries(typeDefs).map(([_k, _v]: [any, any]) => [_k, ((event) => {
    return {
      bind: event.bind,
      unbind: event.unbind
    };
  })(_v, _k as any)]));

  const trigger = Object.fromEntries(Object.entries(typeDefs).map(([_k, _v]: [any, any]) => [_k, ((event) => {
    return event.trigger;
  })(_v, _k as any)]));

  return {
    registry,
    trigger
  };
};

export {
  create
};
