import { SugarElement, SugarNode } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as CaretFinder from './CaretFinder';
import { CaretPosition } from './CaretPosition';
import { getElementFromPosition, getElementFromPrevPosition } from './CaretUtils';

const isBr = (pos: CaretPosition): boolean =>
  getElementFromPosition(pos).exists(ElementType.isBr);

const findBr = (forward: boolean, root: SugarElement<Node>, pos: CaretPosition, schema: Schema): (CaretPosition) | null => {
  const parentBlocks = (Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root)).filter((el) => schema.isBlock(SugarNode.name(el)));
  const scope = ((parentBlocks)[0] ?? null) ?? (root);
  return CaretFinder.fromPosition(forward, scope.dom, pos).filter(isBr);
};

const isBeforeBr = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean =>
  getElementFromPosition(pos).exists(ElementType.isBr) || findBr(true, root, pos, schema) !== null;

const isAfterBr = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean =>
  getElementFromPrevPosition(pos).exists(ElementType.isBr) || findBr(false, root, pos, schema) !== null;

const findPreviousBr = ((..._rest: any[]) => (findBr)(false, ..._rest));
const findNextBr = ((..._rest: any[]) => (findBr)(true, ..._rest));

export {
  findPreviousBr,
  findNextBr,
  isBeforeBr,
  isAfterBr
};
