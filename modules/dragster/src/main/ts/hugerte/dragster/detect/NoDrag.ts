import { Fun } from "@hugerte/katamari";
import { Event, Events } from "@hugerte/porkbun";

import { DragEvents, DragState } from './DragTypes';

export const NoDrag = (): DragState => {
  const events: DragEvents = Events.create({
    move: Event([ 'info' ])
  });

  return {
    onEvent: Fun.noop,
    reset: Fun.noop,
    events: events.registry
  };
};
