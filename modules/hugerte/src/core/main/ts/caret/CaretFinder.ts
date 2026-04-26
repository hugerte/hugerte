
import * as NodeType from '../dom/NodeType';
import * as CaretCandidate from './CaretCandidate';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { CaretWalker } from './CaretWalker';

const walkToPositionIn = (forward: boolean, root: Node, start: Node): (CaretPosition) | null => {
  const position = forward ? CaretPosition.before(start) : CaretPosition.after(start);
  return fromPosition(forward, root, position);
};

const afterElement = (node: Node): CaretPosition =>
  NodeType.isBr(node) ? CaretPosition.before(node) : CaretPosition.after(node);

const isBeforeOrStart = (position: CaretPosition): boolean => {
  if (CaretPosition.isTextPosition(position)) {
    return position.offset() === 0;
  } else {
    return CaretCandidate.isCaretCandidate(position.getNode());
  }
};

const isAfterOrEnd = (position: CaretPosition): boolean => {
  if (CaretPosition.isTextPosition(position)) {
    const container = position.container() as Text;
    return position.offset() === container.data.length;
  } else {
    return CaretCandidate.isCaretCandidate(position.getNode(true));
  }
};

const isBeforeAfterSameElement = (from: CaretPosition, to: CaretPosition): boolean =>
  !CaretPosition.isTextPosition(from) && !CaretPosition.isTextPosition(to) && from.getNode() === to.getNode(true);

const isAtBr = (position: CaretPosition): boolean =>
  !CaretPosition.isTextPosition(position) && NodeType.isBr(position.getNode());

const shouldSkipPosition = (forward: boolean, from: CaretPosition, to: CaretPosition): boolean => {
  if (forward) {
    return !isBeforeAfterSameElement(from, to) && !isAtBr(from) && isAfterOrEnd(from) && isBeforeOrStart(to);
  } else {
    return !isBeforeAfterSameElement(to, from) && isBeforeOrStart(from) && isAfterOrEnd(to);
  }
};

// Finds: <p>a|<b>b</b></p> -> <p>a<b>|b</b></p>
const fromPosition = (forward: boolean, root: Node, pos: CaretPosition): (CaretPosition) | null => {
  const walker = CaretWalker(root);
  return (forward ? walker.next(pos) : walker.prev(pos) ?? null);
};

// Finds: <p>a|<b>b</b></p> -> <p>a<b>b|</b></p>
const navigate = (forward: boolean, root: Node, from: CaretPosition): (CaretPosition) | null =>
  fromPosition(forward, root, from).bind((to) => {
    if (CaretUtils.isInSameBlock(from, to, root) && shouldSkipPosition(forward, from, to)) {
      return fromPosition(forward, root, to);
    } else {
      return to;
    }
  });

const navigateIgnore = (
  forward: boolean,
  root: Node,
  from: CaretPosition,
  ignoreFilter: (pos: CaretPosition) => boolean
): (CaretPosition) | null => navigate(forward, root, from)
  .bind((pos) => ignoreFilter(pos) ? navigateIgnore(forward, root, pos, ignoreFilter) : pos);

const positionIn = (forward: boolean, element: Node): (CaretPosition) | null => {
  const startNode = forward ? element.firstChild : element.lastChild;
  if (NodeType.isText(startNode)) {
    return CaretPosition(startNode, forward ? 0 : startNode.data.length);
  } else if (startNode) {
    if (CaretCandidate.isCaretCandidate(startNode)) {
      return forward ? CaretPosition.before(startNode) : afterElement(startNode);
    } else {
      return walkToPositionIn(forward, element, startNode);
    }
  } else {
    return null;
  }
};

const nextPosition: (root: Node, pos: CaretPosition) => (CaretPosition) | null = ((..._rest: any[]) => (fromPosition)(true, ..._rest));
const prevPosition: (root: Node, pos: CaretPosition) => (CaretPosition) | null = ((..._rest: any[]) => (fromPosition)(false, ..._rest));

const firstPositionIn: (element: Node) => (CaretPosition) | null = ((..._rest: any[]) => (positionIn)(true, ..._rest));
const lastPositionIn: (element: Node) => (CaretPosition) | null = ((..._rest: any[]) => (positionIn)(false, ..._rest));

export {
  fromPosition,
  nextPosition,
  prevPosition,
  navigate,
  navigateIgnore,
  positionIn,
  firstPositionIn,
  lastPositionIn
};
