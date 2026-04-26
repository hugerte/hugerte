
import * as NodeType from '../dom/NodeType';
import * as CaretFinder from './CaretFinder';
import { CaretPosition } from './CaretPosition';
import { isInSameBlock } from './CaretUtils';
import { CaretWalker, HDirection } from './CaretWalker';

export enum BreakType {
  Br,
  Block,
  Wrap,
  Eol
}

export interface LineInfo {
  positions: CaretPosition[];
  breakType: BreakType;
  breakAt: (CaretPosition) | null;
}

type CheckerPredicate = typeof CaretPosition.isAbove | typeof CaretPosition.isBelow;
type LineInfoFinder = (scope: HTMLElement, start: CaretPosition) => LineInfo;

const flip = (direction: HDirection, positions: CaretPosition[]): CaretPosition[] =>
  direction === HDirection.Backwards ? [...(positions)].reverse() : positions;

const walk = (direction: HDirection, caretWalker: CaretWalker, pos: CaretPosition): CaretPosition | null =>
  direction === HDirection.Forwards ? caretWalker.next(pos) : caretWalker.prev(pos);

const getBreakType = (scope: HTMLElement, direction: HDirection, currentPos: CaretPosition, nextPos: CaretPosition): BreakType => {
  if (NodeType.isBr(nextPos.getNode(direction === HDirection.Forwards))) {
    return BreakType.Br;
  } else if (isInSameBlock(currentPos, nextPos) === false) {
    return BreakType.Block;
  } else {
    return BreakType.Wrap;
  }
};

const getPositionsUntil = (predicate: CheckerPredicate, direction: HDirection, scope: HTMLElement, start: CaretPosition): LineInfo => {
  const caretWalker = CaretWalker(scope);
  let currentPos = start;
  const positions: CaretPosition[] = [];

  while (currentPos) {
    const nextPos = walk(direction, caretWalker, currentPos);

    if (!nextPos) {
      break;
    }

    if (NodeType.isBr(nextPos.getNode(false))) {
      if (direction === HDirection.Forwards) {
        return { positions: flip(direction, positions).concat([ nextPos ]), breakType: BreakType.Br, breakAt: nextPos };
      } else {
        return { positions: flip(direction, positions), breakType: BreakType.Br, breakAt: nextPos };
      }
    }

    if (!nextPos.isVisible()) {
      currentPos = nextPos;
      continue;
    }

    if (predicate(currentPos, nextPos)) {
      const breakType = getBreakType(scope, direction, currentPos, nextPos);
      return { positions: flip(direction, positions), breakType, breakAt: nextPos };
    }

    positions.push(nextPos);
    currentPos = nextPos;
  }

  return { positions: flip(direction, positions), breakType: BreakType.Eol, breakAt: null };
};

const getAdjacentLinePositions = (direction: HDirection, getPositionsUntilBreak: LineInfoFinder, scope: HTMLElement, start: CaretPosition): CaretPosition[] =>
  getPositionsUntilBreak(scope, start).breakAt.map((pos) => {
    const positions = getPositionsUntilBreak(scope, pos).positions;
    return direction === HDirection.Backwards ? positions.concat(pos) : [ pos ].concat(positions);
  }) ?? ([]);

const findClosestHorizontalPositionFromPoint = (positions: CaretPosition[], x: number): (CaretPosition) | null =>
  (positions).reduce((acc, newPos) => acc.fold(
    () => newPos,
    (lastPos) => (((lastPos.getClientRects())[0] ?? null) !== null && ((newPos.getClientRects())[0] ?? null) !== null ? ((lastRect, newRect) => {
      const lastDist = Math.abs(x - lastRect.left);
      const newDist = Math.abs(x - newRect.left);
      return newDist <= lastDist ? newPos : lastPos;
    })(((lastPos.getClientRects())[0] ?? null), ((newPos.getClientRects())[0] ?? null)) : null).or(acc)
  ), null);

const findClosestHorizontalPosition = (positions: CaretPosition[], pos: CaretPosition): (CaretPosition) | null =>
  ((pos.getClientRects())[0] ?? null).bind((targetRect) => findClosestHorizontalPositionFromPoint(positions, targetRect.left));

const getPositionsUntilPreviousLine = ((..._rest: any[]) => (getPositionsUntil)(CaretPosition.isAbove, -1, ..._rest));
const getPositionsUntilNextLine = ((..._rest: any[]) => (getPositionsUntil)(CaretPosition.isBelow, 1, ..._rest));
const getPositionsAbove = ((..._rest: any[]) => (getAdjacentLinePositions)(-1, getPositionsUntilPreviousLine, ..._rest));
const getPositionsBelow = ((..._rest: any[]) => (getAdjacentLinePositions)(1, getPositionsUntilNextLine, ..._rest));

const isAtFirstLine = (scope: HTMLElement, pos: CaretPosition): boolean =>
  getPositionsUntilPreviousLine(scope, pos).breakAt === null;

const isAtLastLine = (scope: HTMLElement, pos: CaretPosition): boolean =>
  getPositionsUntilNextLine(scope, pos).breakAt === null;

const getFirstLinePositions = (scope: HTMLElement): CaretPosition[] =>
  CaretFinder.firstPositionIn(scope).map((pos) => [ pos ].concat(getPositionsUntilNextLine(scope, pos).positions)) ?? ([]);

const getLastLinePositions = (scope: HTMLElement): CaretPosition[] =>
  CaretFinder.lastPositionIn(scope).map((pos) => getPositionsUntilPreviousLine(scope, pos).positions.concat(pos)) ?? ([]);

const getClosestPositionAbove = (scope: HTMLElement, pos: CaretPosition): (CaretPosition) | null =>
  findClosestHorizontalPosition(getPositionsAbove(scope, pos), pos);

const getClosestPositionBelow = (scope: HTMLElement, pos: CaretPosition): (CaretPosition) | null =>
  findClosestHorizontalPosition(getPositionsBelow(scope, pos), pos);

export {
  getPositionsUntilPreviousLine,
  getPositionsUntilNextLine,
  isAtFirstLine,
  isAtLastLine,
  getPositionsAbove,
  getPositionsBelow,
  findClosestHorizontalPosition,
  findClosestHorizontalPositionFromPoint,
  getFirstLinePositions,
  getLastLinePositions,
  getClosestPositionAbove,
  getClosestPositionBelow
};
