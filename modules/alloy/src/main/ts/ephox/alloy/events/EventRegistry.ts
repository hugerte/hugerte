import { SugarElement, TransformFind } from '@ephox/sugar';

import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';

export interface ElementAndHandler {
  readonly element: SugarElement<Node>;
  readonly descHandler: CurriedHandler;
}

export interface CurriedHandler {
  readonly purpose: string;
  readonly cHandler: Function;
}

export interface UncurriedHandler {
  readonly purpose: string;
  readonly handler: Function;
}

export interface UidAndHandler {
  readonly id: string;
  readonly descHandler: CurriedHandler;
}

export interface EventRegistry {
  readonly registerId: (extraArgs: any[], id: string, events: Record<EventName, UncurriedHandler>) => void;
  readonly unregisterId: (id: string) => void;
  readonly filterByType: (type: string) => UidAndHandler[];
  readonly find: (isAboveRoot: (elem: SugarElement<Node>) => boolean, type: string, target: SugarElement<Node>) => (ElementAndHandler) | null;
}

const eventHandler = (element: SugarElement<Node>, descHandler: CurriedHandler): ElementAndHandler => ({
  element,
  descHandler
});

const broadcastHandler = (id: string, handler: CurriedHandler): UidAndHandler => ({
  id,
  descHandler: handler
});

export type EventName = string;
export type Uid = string;

export const EventRegistry = (): EventRegistry => {
  const registry: Record<EventName, Record<Uid, CurriedHandler>> = { };

  const registerId = (extraArgs: any[], id: string, events: Record<EventName, UncurriedHandler>) => {
    Object.entries(events).forEach(([_k, _v]: [any, any]) => ((v: UncurriedHandler, k: EventName) => {
      const handlers = registry[k] !== undefined ? registry[k] : { };
      handlers[id] = DescribedHandler.curryArgs(v, extraArgs);
      registry[k] = handlers;
    })(_v, _k));
  };

  const findHandler = (handlers: Record<Uid, CurriedHandler>, elem: SugarElement<Node>): (ElementAndHandler) | null =>
    Tagger.read(elem)
      .bind((id) => ((handlers)[id] ?? null))
      .map((descHandler) => eventHandler(elem, descHandler));

  // Given just the event type, find all handlers regardless of element
  const filterByType = (type: string): UidAndHandler[] =>
    ((registry)[type] ?? null)
      .map((handlers) => Object.entries(handlers).map(([_k, _v]: [any, any]) => ((f, id) => broadcastHandler(id, f))(_v, _k as any)))
       ?? ([ ]);

  // Given event type, and element, find the handler.
  const find = (isAboveRoot: (elem: SugarElement<Node>) => boolean, type: string, target: SugarElement<Node>): (ElementAndHandler) | null =>
    ((registry)[type] ?? null)
      .bind((handlers) => TransformFind.closest(target, (elem) => findHandler(handlers, elem), isAboveRoot));

  const unregisterId = (id: string): void => {
    // INVESTIGATE: Find a better way than mutation if we can.
    Object.entries(registry).forEach(([_k, _v]: [any, any]) => ((handlersById, _eventName) => {
      if (Object.prototype.hasOwnProperty.call(handlersById, id)) {
        delete handlersById[id];
      }
    })(_v, _k));
  };

  return {
    registerId,
    unregisterId,
    filterByType,
    find
  };
};
