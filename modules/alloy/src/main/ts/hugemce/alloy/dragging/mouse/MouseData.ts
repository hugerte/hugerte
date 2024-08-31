import { Optional } from '@hugemce/katamari';
import { EventArgs, SugarPosition } from '@hugemce/sugar';

const getData = (event: EventArgs<MouseEvent>): Optional<SugarPosition> => Optional.from(SugarPosition(event.x, event.y));

// When dragging with the mouse, the delta is simply the difference
// between the two position (previous/old and next/nu)
const getDelta = (old: SugarPosition, nu: SugarPosition): SugarPosition => SugarPosition(nu.left - old.left, nu.top - old.top);

export {
  getData,
  getDelta
};
