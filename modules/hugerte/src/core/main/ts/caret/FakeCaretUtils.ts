
import Editor from '../api/Editor';
import * as CefUtils from '../dom/CefUtils';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { isInlineFakeCaretTarget } from './FakeCaret';

const showCaret = (direction: number, editor: Editor, node: HTMLElement, before: boolean, scrollIntoView: boolean): (Range) | null =>
  // TODO: Figure out a better way to handle this dependency
  (editor._selectionOverrides.showCaret(direction, node, before, scrollIntoView) ?? null);

const getNodeRange = (node: Element): Range => {
  const rng = node.ownerDocument.createRange();
  rng.selectNode(node);
  return rng;
};

const selectNode = (editor: Editor, node: Element): (Range) | null => {
  const e = editor.dispatch('BeforeObjectSelected', { target: node });
  if (e.isDefaultPrevented()) {
    return null;
  }

  return getNodeRange(node);
};

const renderCaretAtRange = (editor: Editor, range: Range, scrollIntoView: boolean): (Range) | null => {
  const normalizedRange = CaretUtils.normalizeRange(1, editor.getBody(), range);
  const caretPosition = CaretPosition.fromRangeStart(normalizedRange);

  const caretPositionNode = caretPosition.getNode();

  if (isInlineFakeCaretTarget(caretPositionNode)) {
    return showCaret(1, editor, caretPositionNode, !caretPosition.isAtEnd(), false);
  }

  const caretPositionBeforeNode = caretPosition.getNode(true);
  if (isInlineFakeCaretTarget(caretPositionBeforeNode)) {
    return showCaret(1, editor, caretPositionBeforeNode, false, false);
  }

  // TODO: Should render caret before/after depending on where you click on the page forces after now
  const ceRoot = CefUtils.getContentEditableRoot(editor.dom.getRoot(), caretPosition.getNode());
  if (isInlineFakeCaretTarget(ceRoot)) {
    return showCaret(1, editor, ceRoot, false, scrollIntoView);
  }

  return null;
};

const renderRangeCaret = (editor: Editor, range: Range, scrollIntoView: boolean): Range =>
  range.collapsed ? renderCaretAtRange(editor, range, scrollIntoView) ?? (range) : range;

export {
  showCaret,
  selectNode,
  renderCaretAtRange,
  renderRangeCaret
};
