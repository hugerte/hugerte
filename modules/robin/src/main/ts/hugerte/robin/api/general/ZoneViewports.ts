import { Fun } from "@hugerte/katamari";

import { ZonePosition } from './ZonePosition';

export interface ZoneViewports<E> {
  assess: (item: E) => ZonePosition<E>;
}

const anything: ZoneViewports<any> = {
  assess: ZonePosition.inView
};

export const ZoneViewports = {
  anything: Fun.constant(anything) as <E>() => ZoneViewports<E>
};
