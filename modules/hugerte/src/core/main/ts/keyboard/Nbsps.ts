import { Arr, Optional, Optionals, Strings, Type, Unicode } from '@ephox/katamari';
import { Css, PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import { isAfterBlock, isAtEndOfBlock, isAtStartOfBlock, isBeforeBlock } from '../caret/BlockBoundary';
import { isAfterBr, isBeforeBr } from '../caret/CaretBr';
import * as CaretFinder from '../caret/CaretFinder';
import { CaretPosition } from '../caret/CaretPosition';
import { isAfterSpace, isBeforeSpace } from '../caret/CaretPositionPredicates';
import { getElementFromPosition, isBlockLike } from '../caret/CaretUtils';
import * as NodeType from '../dom/NodeType';
import * as Parents from '../dom/Parents';
import { isContent, isNbsp, isWhiteSpace } from '../text/CharType';

const isInMiddleOfText = (pos: CaretPosition) => CaretPosition.isTextPosition(pos) && !pos.isAtStart() && !pos.isAtEnd();

const getClosestBlock = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): SugarElement<Node> => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root), (el) => schema.isBlock(SugarNode.name(el)));
  return Arr.head(parentBlocks).getOr(root);
};

const hasSpaceBefore = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInMiddleOfText(pos)) {
    return isAfterSpace(pos);
  } else {
    return isAfterSpace(pos) || CaretFinder.prevPosition(getClosestBlock(root, pos, schema).dom, pos).exists(isAfterSpace);
  }
};

const hasSpaceAfter = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInMiddleOfText(pos)) {
    return isBeforeSpace(pos);
  } else {
    return isBeforeSpace(pos) || CaretFinder.nextPosition(getClosestBlock(root, pos, schema).dom, pos).exists(isBeforeSpace);
  }
};

const isPreValue = (value: string) => Arr.contains([ 'pre', 'pre-wrap' ], value);

const isInPre = (pos: CaretPosition) => getElementFromPosition(pos)
  .bind((elm) => PredicateFind.closest(elm, SugarNode.isElement))
  .exists((elm) => isPreValue(Css.get(elm, 'white-space')));

const isAtBeginningOfBody = (root: SugarElement<Node>, pos: CaretPosition) => CaretFinder.prevPosition(root.dom, pos).isNone();
const isAtEndOfBody = (root: SugarElement<Node>, pos: CaretPosition) => CaretFinder.nextPosition(root.dom, pos).isNone();

const isAtLineBoundary = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => (
  isAtBeginningOfBody(root, pos) ||
    isAtEndOfBody(root, pos) ||
    isAtStartOfBlock(root, pos, schema) ||
    isAtEndOfBlock(root, pos, schema) ||
    isAfterBr(root, pos, schema) ||
    isBeforeBr(root, pos, schema)
);

const isCefBlock = (node: Node | null | undefined): node is HTMLElement =>
  Type.isNonNullable(node) && NodeType.isContentEditableFalse(node) && isBlockLike(node);

// Check the next/previous element in case it is a cef and the next/previous caret position then would skip it, then check
// the next next/previous caret position ( for example in case the next element is a strong, containing a cef ).
const isSiblingCefBlock = (root: Element, direction: 'next' | 'prev') => (container: Node) => {
  return isCefBlock(new DomTreeWalker(container, root)[direction]());
};

const isBeforeCefBlock = (root: SugarElement, pos: CaretPosition) => {
  const nextPos = CaretFinder.nextPosition(root.dom, pos).getOr(pos);
  const isNextCefBlock = isSiblingCefBlock(root.dom, 'next');
  return pos.isAtEnd() && (isNextCefBlock(pos.container()) || isNextCefBlock(nextPos.container()));
};

const isAfterCefBlock = (root: SugarElement, pos: CaretPosition) => {
  const prevPos = CaretFinder.prevPosition(root.dom, pos).getOr(pos);
  const isPrevCefBlock = isSiblingCefBlock(root.dom, 'prev');
  return pos.isAtStart() && (isPrevCefBlock(pos.container()) || isPrevCefBlock(prevPos.container()));
};

const needsToHaveNbsp = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtLineBoundary(root, pos, schema) || hasSpaceBefore(root, pos, schema) || hasSpaceAfter(root, pos, schema);
  }
};

const needsToBeNbspLeft = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtStartOfBlock(root, pos, schema) || isBeforeBlock(root, pos, schema) || isAfterBr(root, pos, schema) || hasSpaceBefore(root, pos, schema) || isAfterCefBlock(root, pos);
  }
};

const leanRight = (pos: CaretPosition): CaretPosition => {
  const container = pos.container();
  const offset = pos.offset();

  if (NodeType.isText(container) && offset < container.data.length) {
    return CaretPosition(container, offset + 1);
  } else {
    return pos;
  }
};

const needsToBeNbspRight = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtEndOfBlock(root, pos, schema) || isAfterBlock(root, pos, schema) || isBeforeBr(root, pos, schema) || hasSpaceAfter(root, pos, schema) || isBeforeCefBlock(root, pos);
  }
};

const needsToBeNbsp = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean =>
  needsToBeNbspLeft(root, pos, schema) || needsToBeNbspRight(root, leanRight(pos), schema);

const isNbspAt = (text: string, offset: number): boolean =>
  isNbsp(text.charAt(offset));

const isWhiteSpaceAt = (text: string, offset: number): boolean =>
  isWhiteSpace(text.charAt(offset));

const hasNbsp = (pos: CaretPosition): boolean => {
  const container = pos.container();
  return NodeType.isText(container) && Strings.contains(container.data, Unicode.nbsp);
};

const normalizeNbspMiddle = (text: string): string => {
  const chars = text.split('');
  return Arr.map(chars, (chr, i) => {
    if (isNbsp(chr) && i > 0 && i < chars.length - 1 && isContent(chars[i - 1]) && isContent(chars[i + 1])) {
      return ' ';
    } else {
      return chr;
    }
  }).join('');
};

const normalizeNbspAtStart = (root: SugarElement<Node>, node: Text, makeNbsp: boolean, schema: Schema): boolean => {
  const text = node.data;
  const firstPos = CaretPosition(node, 0);

  if (!makeNbsp && isNbspAt(text, 0) && !needsToBeNbsp(root, firstPos, schema)) {
    node.data = ' ' + text.slice(1);
    return true;
  } else if (makeNbsp && isWhiteSpaceAt(text, 0) && needsToBeNbspLeft(root, firstPos, schema)) {
    node.data = Unicode.nbsp + text.slice(1);
    return true;
  } else {
    return false;
  }
};

const normalizeNbspInMiddleOfTextNode = (node: Text): boolean => {
  const text = node.data;
  const newText = normalizeNbspMiddle(text);
  if (newText !== text) {
    node.data = newText;
    return true;
  } else {
    return false;
  }
};

const normalizeNbspAtEnd = (root: SugarElement<Node>, node: Text, makeNbsp: boolean, schema: Schema): boolean => {
  const text = node.data;
  const lastPos = CaretPosition(node, text.length - 1);
  if (!makeNbsp && isNbspAt(text, text.length - 1) && !needsToBeNbsp(root, lastPos, schema)) {
    node.data = text.slice(0, -1) + ' ';
    return true;
  } else if (makeNbsp && isWhiteSpaceAt(text, text.length - 1) && needsToBeNbspRight(root, lastPos, schema)) {
    node.data = text.slice(0, -1) + Unicode.nbsp;
    return true;
  } else {
    return false;
  }
};

const normalizeNbsps = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): Optional<CaretPosition> => {
  const container = pos.container();
  if (!NodeType.isText(container)) {
    return Optional.none();
  }

  if (hasNbsp(pos)) {
    const normalized = normalizeNbspAtStart(root, container, false, schema) || normalizeNbspInMiddleOfTextNode(container) || normalizeNbspAtEnd(root, container, false, schema);
    return Optionals.someIf(normalized, pos);
  } else if (needsToBeNbsp(root, pos, schema)) {
    const normalized = normalizeNbspAtStart(root, container, true, schema) || normalizeNbspAtEnd(root, container, true, schema);
    return Optionals.someIf(normalized, pos);
  } else {
    return Optional.none();
  }
};

// Only convert existing nbsps into spaces within a text node, never create new placeholder nbsps,
// since new placeholders should only ever be created at the caret position itself.
const normalizeNbspsInTextNode = (root: SugarElement<Node>, node: Text, schema: Schema): boolean => {
  if (Strings.contains(node.data, Unicode.nbsp)) {
    return normalizeNbspAtStart(root, node, false, schema) || normalizeNbspInMiddleOfTextNode(node) || normalizeNbspAtEnd(root, node, false, schema);
  } else {
    return false;
  }
};

// Walk every editable text node in the block and normalize the nbsps within it. This handles the case
// where typed text ends up in a different text node than the placeholder nbsp (e.g. Firefox inserts new
// text into a separate text node placed after a trailing nbsp that has been wrapped in a span by the
// visualchars plugin), so the nbsp is converted to a regular space as soon as it stops being a placeholder.
const normalizeNbspsInBlock = (root: SugarElement<Node>, block: SugarElement<Node>, schema: Schema): void => {
  const walk = (node: Node): void => {
    if (NodeType.isText(node)) {
      normalizeNbspsInTextNode(root, node, schema);
    } else if (!NodeType.isContentEditableFalse(node)) {
      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        walk(children[i]);
      }
    }
  };

  const children = block.dom.childNodes;
  for (let i = 0; i < children.length; i++) {
    walk(children[i]);
  }
};

const normalizeNbspsInEditor = (editor: Editor): void => {
  const root = SugarElement.fromDom(editor.getBody());

  if (editor.selection.isCollapsed()) {
    const pos = CaretPosition.fromRangeStart(editor.selection.getRng());

    normalizeNbsps(root, pos, editor.schema).each((newPos) => {
      editor.selection.setRng(newPos.toRange());
    });

    // Some browsers (e.g. Firefox) insert typed text into a new text node placed after a trailing
    // placeholder nbsp that has been wrapped in its own element (such as the span created by the
    // visualchars plugin), so the caret container never contains the nbsp and the caret based
    // normalization above does not see it. Normalize the nbsps in the rest of the caret's block as
    // well so a placeholder nbsp is converted into a regular space once it is no longer at a line
    // boundary, matching Chromium behaviour.
    normalizeNbspsInBlock(root, getClosestBlock(root, pos, editor.schema), editor.schema);
  }
};

export {
  needsToBeNbspLeft,
  needsToBeNbspRight,
  needsToBeNbsp,
  needsToHaveNbsp,
  normalizeNbspMiddle,
  normalizeNbspsInEditor
};
