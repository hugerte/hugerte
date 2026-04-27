import { SugarElement, SugarNode } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as CaretFinder from './CaretFinder';
import { CaretPosition } from './CaretPosition';
import { getElementFromPosition, getElementFromPrevPosition } from './CaretUtils';

const isBr = (pos: CaretPosition): boolean => {
  const el = getElementFromPosition(pos);
  return el !== null && ElementType.isBr(el);
};

const findBr = (forward: boolean, root: SugarElement<Node>, pos: CaretPosition, schema: Schema): (CaretPosition) | null => {
  const parentBlocks = (Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root)).filter((el) => schema.isBlock(SugarNode.name(el)));
  const scope = ((parentBlocks)[0] ?? null) ?? (root);
  const result = CaretFinder.fromPosition(forward, scope.dom, pos);
  return result !== null && isBr(result) ? result : null;
};

const isBeforeBr = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  const el = getElementFromPosition(pos);
  return (el !== null && ElementType.isBr(el)) || findBr(true, root, pos, schema) !== null;
};

const isAfterBr = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  const el = getElementFromPrevPosition(pos);
  return (el !== null && ElementType.isBr(el)) || findBr(false, root, pos, schema) !== null;
};

const findPreviousBr = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): CaretPosition | null => findBr(false, root, pos, schema);
const findNextBr = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): CaretPosition | null => findBr(true, root, pos, schema);

export {
  findPreviousBr,
  findNextBr,
  isBeforeBr,
  isAfterBr
};
