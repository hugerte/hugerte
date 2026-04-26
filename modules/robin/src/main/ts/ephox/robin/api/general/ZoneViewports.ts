
import { ZonePosition } from './ZonePosition';

export interface ZoneViewports<E> {
  assess: (item: E) => ZonePosition<E>;
}

const anything: ZoneViewports<any> = {
  assess: ZonePosition.inView
};

export const ZoneViewports = {
  anything: () => anything as <E>() => ZoneViewports<E>
};
