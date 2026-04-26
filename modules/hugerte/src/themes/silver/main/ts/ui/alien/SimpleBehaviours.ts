import { AddEventsBehaviour, AlloyEvents, Behaviour } from '@ephox/alloy';

// Consider moving to alloy once it takes shape.

const namedEvents = (name: string, handlers: Array<AlloyEvents.AlloyEventKeyAndHandler<any>>): Behaviour.AlloyBehaviourRecord =>
  Behaviour.derive([
    AddEventsBehaviour.config(name, handlers)
  ]);

const unnamedEvents = (handlers: Array<AlloyEvents.AlloyEventKeyAndHandler<any>>): Behaviour.AlloyBehaviourRecord =>
  namedEvents((('unnamed-events') + '_' + Math.floor(Math.random() * 1e9) + Date.now()), handlers);

export const SimpleBehaviours = {
  namedEvents,
  unnamedEvents
};
