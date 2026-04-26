import { Insert, PredicateFind, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import * as CaretCandidate from '../caret/CaretCandidate';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as FormatUtils from '../fmt/FormatUtils';
import * as MergeText from './MergeText';

const needsReposition = (pos: CaretPosition, elm: Node): boolean => {
  const container = pos.container();
  const offset = pos.offset();
  return !CaretPosition.isTextPosition(pos) && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
};

const reposition = (elm: Node, pos: CaretPosition): CaretPosition =>
  needsReposition(pos, elm) ? CaretPosition(pos.container(), pos.offset() - 1) : pos;

const beforeOrStartOf = (node: Node): CaretPosition =>
  NodeType.isText(node) ? CaretPosition(node, 0) : CaretPosition.before(node);

const afterOrEndOf = (node: Node): CaretPosition =>
  NodeType.isText(node) ? CaretPosition(node, node.data.length) : CaretPosition.after(node);

const getPreviousSiblingCaretPosition = (elm: Node): (CaretPosition) | null => {
  if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
    return afterOrEndOf(elm.previousSibling);
  } else {
    return elm.previousSibling ? CaretFinder.lastPositionIn(elm.previousSibling) : null;
  }
};

const getNextSiblingCaretPosition = (elm: Node): (CaretPosition) | null => {
  if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
    return beforeOrStartOf(elm.nextSibling);
  } else {
    return elm.nextSibling ? CaretFinder.firstPositionIn(elm.nextSibling) : null;
  }
};

const findCaretPositionBackwardsFromElm = (rootElement: Node, elm: Node): (CaretPosition) | null => {
  return (elm.previousSibling ? elm.previousSibling : elm.parentNode ?? null)
    .bind((node) => CaretFinder.prevPosition(rootElement, CaretPosition.before(node)))
    .orThunk(() => CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)));
};

const findCaretPositionForwardsFromElm = (rootElement: Node, elm: Node): (CaretPosition) | null =>
  CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)).orThunk(
    () => CaretFinder.prevPosition(rootElement, CaretPosition.before(elm))
  );

const findCaretPositionBackwards = (rootElement: Node, elm: Node): (CaretPosition) | null =>
  getPreviousSiblingCaretPosition(elm).orThunk(() => getNextSiblingCaretPosition(elm))
    .orThunk(() => findCaretPositionBackwardsFromElm(rootElement, elm));

const findCaretPositionForward = (rootElement: Node, elm: Node): (CaretPosition) | null =>
  getNextSiblingCaretPosition(elm)
    .orThunk(() => getPreviousSiblingCaretPosition(elm))
    .orThunk(() => findCaretPositionForwardsFromElm(rootElement, elm));

const findCaretPosition = (forward: boolean, rootElement: Node, elm: Node): (CaretPosition) | null =>
  forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);

const findCaretPosOutsideElmAfterDelete = (forward: boolean, rootElement: Node, elm: Node): (CaretPosition) | null =>
  findCaretPosition(forward, rootElement, elm).map(((..._rest: any[]) => (reposition)(elm, ..._rest)));

const setSelection = (editor: Editor, forward: boolean, pos: (CaretPosition) | null): void => {
  pos.fold(
    () => {
      editor.focus();
    },
    (pos) => {
      editor.selection.setRng(pos.toRange(), forward);
    }
  );
};

const eqRawNode = (rawNode: Node) => (elm: SugarElement<Node>): boolean =>
  elm.dom === rawNode;

const isBlock = (editor: Editor, elm: SugarElement<Node>): boolean =>
  elm && Object.prototype.hasOwnProperty.call(editor.schema.getBlockElements(), SugarNode.name(elm));

const paddEmptyBlock = (schema: Schema, elm: SugarElement<Node>, preserveEmptyCaret: boolean): (CaretPosition) | null => {
  if (Empty.isEmpty(schema, elm)) {
    const br = SugarElement.fromHtml('<br data-mce-bogus="1">');
    // Remove all bogus elements except caret
    if (preserveEmptyCaret) {
      (Traverse.children(elm)).forEach((node) => {
        if (!FormatUtils.isEmptyCaretFormatElement(node)) {
          Remove.remove(node);
        }
      });
    } else {
      Remove.empty(elm);
    }
    Insert.append(elm, br);
    return CaretPosition.before(br.dom);
  } else {
    return null;
  }
};

const deleteNormalized = (elm: SugarElement<Node>, afterDeletePosOpt: (CaretPosition) | null, schema: Schema, normalizeWhitespace?: boolean): (CaretPosition) | null => {
  const prevTextOpt = Traverse.prevSibling(elm).filter(SugarNode.isText);
  const nextTextOpt = Traverse.nextSibling(elm).filter(SugarNode.isText);

  // Delete the element
  Remove.remove(elm);

  // Merge and normalize any prev/next text nodes, so that they are merged and don't lose meaningful whitespace
  // eg. <p>a <span></span> b</p> -> <p>a &nsbp;b</p> or <p><span></span> a</p> -> <p>&nbsp;a</a>
  return (prevTextOpt !== null && nextTextOpt !== null && afterDeletePosOpt !== null ? ((prev, next, pos) => {
    const prevNode = prev.dom, nextNode = next.dom;
    const offset = prevNode.data.length;
    MergeText.mergeTextNodes(prevNode, nextNode, schema, normalizeWhitespace);
    // Update the cursor position if required
    return pos.container() === nextNode ? CaretPosition(prevNode, offset) : pos;
  })(prevTextOpt, nextTextOpt, afterDeletePosOpt) : null).orThunk(() => {
    if (normalizeWhitespace) {
      prevTextOpt.each((elm) => MergeText.normalizeWhitespaceBefore(elm.dom, elm.dom.length, schema));
      nextTextOpt.each((elm) => MergeText.normalizeWhitespaceAfter(elm.dom, 0, schema));
    }
    return afterDeletePosOpt;
  });
};

const isInlineElement = (editor: Editor, element: SugarElement<Node>): boolean =>
  Object.prototype.hasOwnProperty.call(editor.schema.getTextInlineElements(), SugarNode.name(element));

const deleteElement = (
  editor: Editor,
  forward: boolean,
  elm: SugarElement<Node>,
  moveCaret: boolean = true,
  preserveEmptyCaret: boolean = false
): void => {
  // Existing delete logic
  const afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom);
  const parentBlock = PredicateFind.ancestor(elm, ((..._rest: any[]) => (isBlock)(editor, ..._rest)), eqRawNode(editor.getBody()));
  const normalizedAfterDeletePos = deleteNormalized(elm, afterDeletePos, editor.schema, isInlineElement(editor, elm));

  if (editor.dom.isEmpty(editor.getBody())) {
    editor.setContent('');
    editor.selection.setCursorLocation();
  } else {
    parentBlock.bind((elm) => paddEmptyBlock(editor.schema, elm, preserveEmptyCaret)).fold(
      () => {
        if (moveCaret) {
          setSelection(editor, forward, normalizedAfterDeletePos);
        }
      },
      (paddPos) => {
        if (moveCaret) {
          setSelection(editor, forward, paddPos);
        }
      }
    );
  }
};

export {
  deleteElement
};
