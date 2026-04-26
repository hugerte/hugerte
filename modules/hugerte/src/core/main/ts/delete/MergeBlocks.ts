import { Compare, Insert, Remove, Replication, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Empty from '../dom/Empty';
import * as PaddingBr from '../dom/PaddingBr';
import * as Parents from '../dom/Parents';

const getChildrenUntilBlockBoundary = (block: SugarElement<Element>, schema: Schema): SugarElement<Node>[] => {
  const children = Traverse.children(block);
  return (children).findIndex((el) => schema.isBlock(SugarNode.name(el))).fold(
    () => children,
    (index) => children.slice(0, index)
  );
};

const extractChildren = (block: SugarElement<Element>, schema: Schema): SugarElement<Node>[] => {
  const children = getChildrenUntilBlockBoundary(block, schema);
  (children).forEach(Remove.remove);
  return children;
};

const removeEmptyRoot = (schema: Schema, rootNode: SugarElement<Node>, block: SugarElement<Element>) => {
  const parents = Parents.parentsAndSelf(block, rootNode);
  return ((parents.reverse()).find((element) => Empty.isEmpty(schema, element)) ?? null).each(Remove.remove);
};

const isEmptyBefore = (schema: Schema, el: SugarElement<Node>): boolean =>
  (Traverse.prevSiblings(el)).filter((el) => !Empty.isEmpty(schema, el)).length === 0;

const nestedBlockMerge = (
  rootNode: SugarElement<Node>,
  fromBlock: SugarElement<Element>,
  toBlock: SugarElement<Element>,
  schema: Schema,
  insertionPoint: SugarElement<Node>
): (CaretPosition) | null => {
  if (Empty.isEmpty(schema, toBlock)) {
    PaddingBr.fillWithPaddingBr(toBlock);
    return CaretFinder.firstPositionIn(toBlock.dom);
  }

  if (isEmptyBefore(schema, insertionPoint) && Empty.isEmpty(schema, fromBlock)) {
    Insert.before(insertionPoint, SugarElement.fromTag('br'));
  }

  const position = CaretFinder.prevPosition(toBlock.dom, CaretPosition.before(insertionPoint.dom));
  (extractChildren(fromBlock, schema)).forEach((child) => {
    Insert.before(insertionPoint, child);
  });
  removeEmptyRoot(schema, rootNode, fromBlock);
  return position;
};

const isInline = (schema: Schema, node: SugarElement<Node>): node is SugarElement<HTMLElement> => schema.isInline(SugarNode.name(node));

const sidelongBlockMerge = (rootNode: SugarElement<Node>, fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>, schema: Schema): (CaretPosition) | null => {
  if (Empty.isEmpty(schema, toBlock)) {
    if (Empty.isEmpty(schema, fromBlock)) {
      const getInlineToBlockDescendants = (el: SugarElement<Element>) => {
        const helper = (node: SugarElement<Element>, elements: SugarElement<Element>[]): SugarElement<Element>[] =>
          Traverse.firstChild(node).fold(
            () => elements,
            (child) => isInline(schema, child) ? helper(child, elements.concat(Replication.shallow(child))) : elements
          );
        return helper(el, []);
      };

      const newFromBlockDescendants = (getInlineToBlockDescendants(toBlock)).reduceRight((element: SugarElement<Element>, descendant) => {
          Insert.wrap(element, descendant);
          return descendant;
        }, PaddingBr.createPaddingBr());

      Remove.empty(fromBlock);
      Insert.append(fromBlock, newFromBlockDescendants);
    }

    Remove.remove(toBlock);
    return CaretFinder.firstPositionIn(fromBlock.dom);
  }

  const position = CaretFinder.lastPositionIn(toBlock.dom);
  (extractChildren(fromBlock, schema)).forEach((child) => {
    Insert.append(toBlock, child);
  });
  removeEmptyRoot(schema, rootNode, fromBlock);
  return position;
};

const findInsertionPoint = (toBlock: SugarElement<Element>, block: SugarElement<Element>) => {
  const parentsAndSelf = Parents.parentsAndSelf(block, toBlock);
  return (parentsAndSelf[parentsAndSelf.length - 1] ?? null);
};

const getInsertionPoint = (fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>): (SugarElement) | null =>
  Compare.contains(toBlock, fromBlock) ? findInsertionPoint(toBlock, fromBlock) : null;

const trimBr = (first: boolean, block: SugarElement<Element>) => {
  CaretFinder.positionIn(first, block.dom)
    .bind((position) => (position.getNode() ?? null))
    .map(SugarElement.fromDom)
    .filter(ElementType.isBr)
    .each(Remove.remove);
};

const mergeBlockInto = (rootNode: SugarElement<Node>, fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>, schema: Schema): (CaretPosition) | null => {
  trimBr(true, fromBlock);
  trimBr(false, toBlock);

  return getInsertionPoint(fromBlock, toBlock).fold(
    ((..._rest: any[]) => (sidelongBlockMerge)(rootNode, fromBlock, toBlock, schema, ..._rest)),
    ((..._rest: any[]) => (nestedBlockMerge)(rootNode, fromBlock, toBlock, schema, ..._rest))
  );
};

const mergeBlocks = (rootNode: SugarElement<Node>, forward: boolean, block1: SugarElement<Element>, block2: SugarElement<Element>, schema: Schema): (CaretPosition) | null =>
  forward ? mergeBlockInto(rootNode, block2, block1, schema) : mergeBlockInto(rootNode, block1, block2, schema);

export {
  mergeBlocks
};
