import { Compare, SugarElement, SugarNode } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import * as Parents from '../dom/Parents';
import * as CaretFinder from './CaretFinder';
import { CaretPosition } from './CaretPosition';
import { isEmptyText } from './CaretPositionPredicates';
import { isInSameBlock } from './CaretUtils';

const navigateIgnoreEmptyTextNodes = (forward: boolean, root: Node, from: CaretPosition): (CaretPosition) | null =>
  CaretFinder.navigateIgnore(forward, root, from, isEmptyText);

const isBlock = (schema: Schema) => (el: SugarElement<Node>): el is SugarElement<Element> => schema.isBlock(SugarNode.name(el));

const getClosestBlock = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): (SugarElement<Element>) | null =>
  ((Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root)).find(isBlock(schema)) ?? null);

const isAtBeforeAfterBlockBoundary = (forward: boolean, root: SugarElement<Node>, pos: CaretPosition, schema: Schema) => {
  const newPos = navigateIgnoreEmptyTextNodes(forward, root.dom, pos);
  if (newPos === null) {
    return true;
  }
  const closestBlock = getClosestBlock(root, pos, schema);
  if (closestBlock === null) {
    return !isInSameBlock(newPos, pos, root.dom);
  } else {
    return !isInSameBlock(newPos, pos, root.dom) && Compare.contains(closestBlock, SugarElement.fromDom(newPos.container()));
  }
};

const isAtBlockBoundary = (forward: boolean, root: SugarElement<Node>, pos: CaretPosition, schema: Schema) => {
  const closestBlock = getClosestBlock(root, pos, schema);
  if (closestBlock === null) {
    const nav = navigateIgnoreEmptyTextNodes(forward, root.dom, pos);
    return nav === null || !isInSameBlock(nav, pos, root.dom);
  } else {
    return navigateIgnoreEmptyTextNodes(forward, closestBlock.dom, pos) === null;
  }
};

const isAtStartOfBlock = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => isAtBlockBoundary(false, root, pos, schema);
const isAtEndOfBlock = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => isAtBlockBoundary(true, root, pos, schema);
const isBeforeBlock = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => isAtBeforeAfterBlockBoundary(false, root, pos, schema);
const isAfterBlock = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => isAtBeforeAfterBlockBoundary(true, root, pos, schema);

export {
  isAtStartOfBlock,
  isAtEndOfBlock,
  isBeforeBlock,
  isAfterBlock
};
