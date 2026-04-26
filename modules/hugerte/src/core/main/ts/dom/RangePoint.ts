
import * as ClientRect from '../geom/ClientRect';

const isXYWithinRange = (clientX: number, clientY: number, range: Range): boolean => {
  if (range.collapsed) {
    return false;
  } else {
    return (range.getClientRects()).some((rect) => ClientRect.containsXY(rect, clientX, clientY));
  }
};

export {
  isXYWithinRange
};
