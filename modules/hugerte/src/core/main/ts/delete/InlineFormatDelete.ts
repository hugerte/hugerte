import { PredicateExists, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import * as Parents from '../dom/Parents';
import * as CaretFormat from '../fmt/CaretFormat';
import * as FormatContainer from '../fmt/FormatContainer';
import * as FormatUtils from '../fmt/FormatUtils';
import * as DeleteElement from './DeleteElement';
import * as DeleteUtils from './DeleteUtils';

const hasMultipleChildren = (elm: SugarElement<Node>): boolean =>
  Traverse.childNodesCount(elm) > 1;

const getParentsUntil = (editor: Editor, pred: (elm: SugarElement<Node>) => boolean): SugarElement<Node>[] => {
  const rootElm = SugarElement.fromDom(editor.getBody());
  const startElm = SugarElement.fromDom(editor.selection.getStart());
  const parents = Parents.parentsAndSelf(startElm, rootElm);
  return (parents).findIndex(pred).fold(
    () => parents,
    (index) => parents.slice(0, index)
  );
};

const hasOnlyOneChild = (elm: SugarElement<Node>): boolean =>
  Traverse.childNodesCount(elm) === 1;

const getParentInlinesUntilMultichildInline = (editor: Editor): SugarElement<Node>[] =>
  getParentsUntil(editor, (elm) => editor.schema.isBlock(SugarNode.name(elm)) || hasMultipleChildren(elm));

const getParentInlines = (editor: Editor): SugarElement<Node>[] =>
  getParentsUntil(editor, (el) => editor.schema.isBlock(SugarNode.name(el)));

const getFormatNodes = (editor: Editor, parentInlines: SugarElement<Node>[]): Node[] => {
  const isFormatElement = ((..._rest: any[]) => (CaretFormat.isFormatElement)(editor, ..._rest));
  return (parentInlines).flatMap((elm) => isFormatElement(elm) ? [ elm.dom ] : [ ]);
};

const getFormatNodesAtStart = (editor: Editor) => {
  const parentInlines = getParentInlines(editor);
  return getFormatNodes(editor, parentInlines);
};

const deleteLastPosition = (forward: boolean, editor: Editor, target: SugarElement<Node>, parentInlines: SugarElement<Node>[]): void => {
  const formatNodes = getFormatNodes(editor, parentInlines);

  if (formatNodes.length === 0) {
    DeleteElement.deleteElement(editor, forward, target);
  } else {
    const pos = CaretFormat.replaceWithCaretFormat(target.dom, formatNodes);
    editor.selection.setRng(pos.toRange());
  }
};

const deleteCaret = (editor: Editor, forward: boolean): (() => void) | null => {
  const parentInlines = (getParentInlinesUntilMultichildInline(editor)).filter(hasOnlyOneChild);
  return ((parentInlines).at(-1) ?? null).bind((target) => {
    const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
    if (DeleteUtils.willDeleteLastPositionInElement(forward, fromPos, target.dom) && !FormatUtils.isEmptyCaretFormatElement(target)) {
      return () => deleteLastPosition(forward, editor, target, parentInlines);
    } else {
      return null;
    }
  });
};

const isBrInEmptyElement = (editor: Editor, elm: Element): boolean => {
  const parentElm = elm.parentElement;
  return NodeType.isBr(elm) && !(parentElm) === null && editor.dom.isEmpty(parentElm);
};

const isEmptyCaret = (elm: Element): boolean =>
  FormatUtils.isEmptyCaretFormatElement(SugarElement.fromDom(elm));

const createCaretFormatAtStart = (editor: Editor, formatNodes: Node[]): void => {
  const startElm = editor.selection.getStart();
  // replace <br> in empty node or existing caret at start if applicable
  // otherwise create new caret format at start
  const pos = isBrInEmptyElement(editor, startElm) || isEmptyCaret(startElm)
    ? CaretFormat.replaceWithCaretFormat(startElm, formatNodes)
    : CaretFormat.createCaretFormatAtStart(editor.selection.getRng(), formatNodes);
  editor.selection.setRng(pos.toRange());
};

const updateCaretFormat = (editor: Editor, updateFormats: Node[]): void => {
  // Create a caret format at cursor containing missing formats to ensure all formats
  // that are supposed to be retained are retained
  const missingFormats = (updateFormats).filter((_x: any) => !(getFormatNodesAtStart(editor)).includes(_x));
  if (missingFormats.length > 0) {
    createCaretFormatAtStart(editor, missingFormats);
  }
};

const rangeStartsAtTextContainer = (rng: Range): boolean =>
  NodeType.isText(rng.startContainer);

const rangeStartsAtStartOfTextContainer = (rng: Range): boolean =>
  rng.startOffset === 0 && rangeStartsAtTextContainer(rng);

const rangeStartParentIsFormatElement = (editor: Editor, rng: Range): boolean => {
  const startParent = rng.startContainer.parentElement;
  return !(startParent) === null && CaretFormat.isFormatElement(editor, SugarElement.fromDom(startParent));
};

const rangeStartAndEndHaveSameParent = (rng: Range): boolean => {
  const startParent = rng.startContainer.parentNode;
  const endParent = rng.endContainer.parentNode;
  return !(startParent) === null && !(endParent) === null && startParent.isEqualNode(endParent);
};

const rangeEndsAtEndOfEndContainer = (rng: Range): boolean => {
  const endContainer = rng.endContainer;
  return rng.endOffset === (NodeType.isText(endContainer) ? endContainer.length : endContainer.childNodes.length);
};

const rangeEndsAtEndOfStartContainer = (rng: Range): boolean =>
  rangeStartAndEndHaveSameParent(rng) && rangeEndsAtEndOfEndContainer(rng);

const rangeEndsAfterEndOfStartContainer = (rng: Range): boolean =>
  !rng.endContainer.isEqualNode(rng.commonAncestorContainer);

const rangeEndsAtOrAfterEndOfStartContainer = (rng: Range): boolean =>
  rangeEndsAtEndOfStartContainer(rng) || rangeEndsAfterEndOfStartContainer(rng);

const requiresDeleteRangeOverride = (editor: Editor): boolean => {
  const rng = editor.selection.getRng();
  return rangeStartsAtStartOfTextContainer(rng) && rangeStartParentIsFormatElement(editor, rng) && rangeEndsAtOrAfterEndOfStartContainer(rng);
};

const deleteRange = (editor: Editor): (() => void) | null => {
  if (requiresDeleteRangeOverride(editor)) {
    const formatNodes = getFormatNodesAtStart(editor);
    return () => {
      DeleteUtils.execNativeDeleteCommand(editor);
      updateCaretFormat(editor, formatNodes);
    };
  } else {
    return null;
  }
};

const backspaceDelete = (editor: Editor, forward: boolean): (() => void) | null =>
  editor.selection.isCollapsed() ? deleteCaret(editor, forward) : deleteRange(editor);

const hasAncestorInlineCaret = (elm: SugarElement<Node>, schema: Schema): boolean =>
  PredicateExists.ancestor(elm, (node) => FormatContainer.isCaretNode(node.dom), (el) => schema.isBlock(SugarNode.name(el)));

const hasAncestorInlineCaretAtStart = (editor: Editor): boolean =>
  hasAncestorInlineCaret(SugarElement.fromDom(editor.selection.getStart()), editor.schema);

const requiresRefreshCaretOverride = (editor: Editor): boolean => {
  const rng = editor.selection.getRng();
  return rng.collapsed && (rangeStartsAtTextContainer(rng) || editor.dom.isEmpty(rng.startContainer)) && !hasAncestorInlineCaretAtStart(editor);
};

const refreshCaret = (editor: Editor): boolean => {
  if (requiresRefreshCaretOverride(editor)) {
    createCaretFormatAtStart(editor, []);
  }
  return true;
};

export {
  backspaceDelete,
  refreshCaret
};
