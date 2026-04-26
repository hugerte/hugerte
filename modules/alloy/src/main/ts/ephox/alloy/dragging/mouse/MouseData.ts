import { EventArgs, SugarPosition } from '@ephox/sugar';

const getData = (event: EventArgs<MouseEvent>): (SugarPosition) | null => (SugarPosition(event.x, event.y) ?? null);

// When dragging with the mouse, the delta is simply the difference
// between the two position (previous/old and next/nu)
const getDelta = (old: SugarPosition, nu: SugarPosition): SugarPosition => SugarPosition(nu.left - old.left, nu.top - old.top);

export {
  getData,
  getDelta
};
