import { Cell, Obj } from '@hugemce/katamari';
import { SugarElement } from '@hugemce/sugar';

import { EventFormat } from './SimulatedEvent';

const derive = (rawEvent: EventFormat, rawTarget: SugarElement<Node>): Cell<SugarElement<Node>> => {
  const source = Obj.get(rawEvent, 'target').getOr(rawTarget);

  return Cell(source);
};

export {
  derive
};
