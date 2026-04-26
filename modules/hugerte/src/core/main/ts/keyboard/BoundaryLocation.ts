import { Adt, Optional } from '@ephox/katamari';

import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import { getParentCaretContainer } from '../fmt/FormatContainer';
import * as LazyEvaluator from '../util/LazyEvaluator';
import * as InlineUtils from './InlineUtils';

export interface LocationAdt {
  fold: <T> (
    before: (element: Element) => T,
    start: (element: Element) => T,
    end: (element: Element) => T,
    after: (element: Element) => T
  ) => T;
  match: <T> (branches: {
    before: (element: Element) => T;
    start: (element: Element) => T;
    end: (element: Element) => T;
    after: (element: Element) => T;
  }) => T;
  log: (label: string) => void;
}

const Location = Adt.generate([
  { before: [ 'element' ] },
  { start: [ 'element' ] },
  { end: [ 'element' ] },
  { after: [ 'element' ] }
]);

const rescope = (rootNode: Node, node: Node) => {
  const parentBlock = CaretUtils.getParentBlock(node, rootNode);
  return parentBlock ? parentBlock : rootNode;
};

const before = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) => {
  const nPos = InlineUtils.normalizeForwards(pos);
  const scope = rescope(rootNode, nPos.container());
  return InlineUtils.findRootInline(isInlineTarget, scope, nPos).fold(
    () => CaretFinder.nextPosition(scope, nPos)
      .bind(((..._rest: any[]) => (InlineUtils.findRootInline)(isInlineTarget, scope, ..._rest)))
      .map((inline) => Location.before(inline)),
    Optional.none
  );
};

const isNotInsideFormatCaretContainer = (rootNode: Node, elm: Node) =>
  getParentCaretContainer(rootNode, elm) === null;

const findInsideRootInline = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) =>
  InlineUtils.findRootInline(isInlineTarget, rootNode, pos).filter(((..._rest: any[]) => (isNotInsideFormatCaretContainer)(rootNode, ..._rest)));

const start = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) => {
  const nPos = InlineUtils.normalizeBackwards(pos);
  return findInsideRootInline(isInlineTarget, rootNode, nPos).bind((inline) => {
    const prevPos = CaretFinder.prevPosition(inline, nPos);
    return prevPos === null ? Location.start(inline) : null;
  });
};

const end = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) => {
  const nPos = InlineUtils.normalizeForwards(pos);
  return findInsideRootInline(isInlineTarget, rootNode, nPos).bind((inline) => {
    const nextPos = CaretFinder.nextPosition(inline, nPos);
    return nextPos === null ? Location.end(inline) : null;
  });
};

const after = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) => {
  const nPos = InlineUtils.normalizeBackwards(pos);
  const scope = rescope(rootNode, nPos.container());
  return InlineUtils.findRootInline(isInlineTarget, scope, nPos).fold(
    () => CaretFinder.prevPosition(scope, nPos)
      .bind(((..._rest: any[]) => (InlineUtils.findRootInline)(isInlineTarget, scope, ..._rest)))
      .map((inline) => Location.after(inline)),
    Optional.none
  );
};

const isValidLocation = (location: LocationAdt) => !InlineUtils.isRtl(getElement(location));

const readLocation = (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition): (LocationAdt) | null => {
  const location = LazyEvaluator.evaluateUntil([
    before,
    start,
    end,
    after
  ], [ isInlineTarget, rootNode, pos ]);

  return location.filter(isValidLocation);
};

const getElement = (location: LocationAdt): Element => location.fold(
  (x: any) => x, // Before
  (x: any) => x, // Start
  (x: any) => x, // End
  (x: any) => x  // After
);

const getName = (location: LocationAdt): string => location.fold(
  () => 'before', // Before
  () => 'start',  // Start
  () => 'end',    // End
  () => 'after'   // After
);

const outside = (location: LocationAdt): LocationAdt => location.fold(
  Location.before, // Before
  Location.before, // Start
  Location.after,  // End
  Location.after   // After
);

const inside = (location: LocationAdt): LocationAdt => location.fold(
  Location.start, // Before
  Location.start, // Start
  Location.end,   // End
  Location.end    // After
);

const isEq = (location1: LocationAdt, location2: LocationAdt) =>
  getName(location1) === getName(location2) && getElement(location1) === getElement(location2);

const betweenInlines = (forward: boolean, isInlineTarget: (node: Node) => boolean, rootNode: Node, from: CaretPosition, to: CaretPosition, location: LocationAdt) =>
  (InlineUtils.findRootInline(isInlineTarget, rootNode, from) !== null && InlineUtils.findRootInline(isInlineTarget, rootNode, to) !== null ? ((fromInline, toInline) => {
      if (fromInline !== toInline && InlineUtils.hasSameParentBlock(rootNode, fromInline, toInline)) {
        // Force after since some browsers normalize and lean left into the closest inline
        return Location.after(forward ? fromInline : toInline);
      } else {
        return location;
      }
    })(InlineUtils.findRootInline(isInlineTarget, rootNode, from), InlineUtils.findRootInline(isInlineTarget, rootNode, to)) : null) ?? (location);

const skipNoMovement = (fromLocation: (LocationAdt) | null, toLocation: LocationAdt) => fromLocation.fold(
  (() => true as const),
  (fromLocation) => !isEq(fromLocation, toLocation)
);

const findLocationTraverse = (forward: boolean, isInlineTarget: (node: Node) => boolean, rootNode: Node, fromLocation: (LocationAdt) | null, pos: CaretPosition): (LocationAdt) | null => {
  const from = InlineUtils.normalizePosition(forward, pos);
  const to = CaretFinder.fromPosition(forward, rootNode, from).map(((..._rest: any[]) => (InlineUtils.normalizePosition)(forward, ..._rest)));

  const location = to.fold(
    () => fromLocation.map(outside),
    (to) => readLocation(isInlineTarget, rootNode, to)
      .map(((..._rest: any[]) => (betweenInlines)(forward, isInlineTarget, rootNode, from, to, ..._rest)))
      .filter(((..._rest: any[]) => (skipNoMovement)(fromLocation, ..._rest)))
  );

  return location.filter(isValidLocation);
};

const findLocationSimple = (forward: boolean, location: LocationAdt): (LocationAdt) | null => {
  if (forward) {
    return location.fold<(LocationAdt) | null>(
      ((x: any) => (Optional.some)((Location.start)(x))), // Before -> Start
      Optional.none,
      ((x: any) => (Optional.some)((Location.after)(x))), // End -> After
      Optional.none
    );
  } else {
    return location.fold<(LocationAdt) | null>(
      Optional.none,
      ((x: any) => (Optional.some)((Location.before)(x))), // Before <- Start
      Optional.none,
      ((x: any) => (Optional.some)((Location.end)(x))) // End <- After
    );
  }
};

const findLocation = (forward: boolean, isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition): (LocationAdt) | null => {
  const from = InlineUtils.normalizePosition(forward, pos);
  const fromLocation = readLocation(isInlineTarget, rootNode, from);

  return readLocation(isInlineTarget, rootNode, from).bind(((..._rest: any[]) => (findLocationSimple)(forward, ..._rest)))
    .orThunk(() => findLocationTraverse(forward, isInlineTarget, rootNode, fromLocation, pos));
};

const prevLocation = ((..._rest: any[]) => (findLocation)(false, ..._rest));
const nextLocation = ((..._rest: any[]) => (findLocation)(true, ..._rest));

export {
  readLocation,
  findLocation,
  prevLocation,
  nextLocation,
  getElement,
  outside,
  inside
};
