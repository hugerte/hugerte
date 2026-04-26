
import { SugarPosition } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import { AnchorBox } from './LayoutTypes';

export interface BoundsRestriction {
  readonly left: (number) | null;
  readonly right: (number) | null;
  readonly top: (number) | null;
  readonly bottom: (number) | null;
}

export const enum AnchorBoxBounds {
  RightEdge,
  LeftEdge,
  TopEdge,
  BottomEdge
}

type BoundsRestrictionKeys = keyof BoundsRestriction;
type Restriction = AnchorBoxBounds;

const getRestriction = (anchor: AnchorBox, restriction: Restriction) => {
  switch (restriction) {
    case AnchorBoxBounds.LeftEdge:
      return anchor.x;
    case AnchorBoxBounds.RightEdge:
      return anchor.x + anchor.width;
    case AnchorBoxBounds.TopEdge:
      return anchor.y;
    case AnchorBoxBounds.BottomEdge:
      return anchor.y + anchor.height;
  }
};

export const boundsRestriction = (
  anchor: AnchorBox,
  restrictions: Partial<Record<BoundsRestrictionKeys, Restriction>>
): BoundsRestriction => Object.fromEntries(([ 'left', 'right', 'top', 'bottom' ]).map((_k: any) => [_k, ((dir) => ((restrictions)[dir] ?? null).map(
    (restriction) => getRestriction(anchor, restriction)
  ))(_k)]));

export const adjustBounds = (bounds: Boxes.Bounds, restriction: BoundsRestriction, bubbleOffset: SugarPosition): Boxes.Bounds => {
  const applyRestriction = (dir: BoundsRestrictionKeys, current: number) =>
    restriction[dir].map((pos) => {
      const isVerticalAxis = dir === 'top' || dir === 'bottom';
      const offset = isVerticalAxis ? bubbleOffset.top : bubbleOffset.left;
      const comparator = dir === 'left' || dir === 'top' ? Math.max : Math.min;
      const newPos = comparator(pos, current) + offset;
      // Ensure the new restricted position is within the current bounds
      return isVerticalAxis ? Math.min(Math.max(newPos, bounds.y), bounds.bottom) : Math.min(Math.max(newPos, bounds.x), bounds.right);
    }) ?? (current);

  const adjustedLeft = applyRestriction('left', bounds.x);
  const adjustedTop = applyRestriction('top', bounds.y);
  const adjustedRight = applyRestriction('right', bounds.right);
  const adjustedBottom = applyRestriction('bottom', bounds.bottom);

  return Boxes.bounds(adjustedLeft, adjustedTop, adjustedRight - adjustedLeft, adjustedBottom - adjustedTop);
};
