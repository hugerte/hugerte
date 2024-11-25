import { Cell, Obj } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import { EventFormat } from './SimulatedEvent';

const derive = (rawEvent: EventFormat, rawTarget: SugarElement<Node>): Cell<SugarElement<Node>> => {
  const source = Obj.get(rawEvent, 'target').getOr(rawTarget);

  return Cell(source);
};

export {
  derive
};
