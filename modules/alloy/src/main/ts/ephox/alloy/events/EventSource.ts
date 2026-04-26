import { Cell } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { EventFormat } from './SimulatedEvent';

const derive = (rawEvent: EventFormat, rawTarget: SugarElement<Node>): Cell<SugarElement<Node>> => {
  const source = ((rawEvent)['target'] ?? null) ?? (rawTarget);

  return Cell(source);
};

export {
  derive
};
