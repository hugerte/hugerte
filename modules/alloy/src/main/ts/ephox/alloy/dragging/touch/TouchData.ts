import { EventArgs, SugarPosition } from '@ephox/sugar';

const getDataFrom = (touches: TouchList): (SugarPosition) | null => {
  const touch = touches[0];
  return SugarPosition(touch.clientX, touch.clientY);
};

const getData = (event: EventArgs<TouchEvent>): (SugarPosition) | null => {
  const raw = event.raw;
  const touches = raw.touches;
  return touches.length === 1 ? getDataFrom(touches) : null;
};

// When dragging the touch, the delta is simply the difference
// between the two touch positions (previous/old and next/nu)
const getDelta = (old: SugarPosition, nu: SugarPosition): SugarPosition => SugarPosition(nu.left - old.left, nu.top - old.top);

export {
  getData,
  getDelta
};
