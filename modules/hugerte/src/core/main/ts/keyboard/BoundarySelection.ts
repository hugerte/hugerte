import { Cell } from '@ephox/katamari';
import { SelectorFilter, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as CaretContainerRemove from '../caret/CaretContainerRemove';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as WordSelection from '../selection/WordSelection';
import * as BoundaryCaret from './BoundaryCaret';
import * as BoundaryLocation from './BoundaryLocation';
import * as InlineUtils from './InlineUtils';
import * as NavigationUtils from './NavigationUtils';

const setCaretPosition = (editor: Editor, pos: CaretPosition): void => {
  const rng = editor.dom.createRng();
  rng.setStart(pos.container(), pos.offset());
  rng.setEnd(pos.container(), pos.offset());
  editor.selection.setRng(rng);
};

type NodePredicate = (node: Node) => node is Element;

const setSelected = (state: boolean, elm: Element) => {
  if (state) {
    elm.setAttribute('data-mce-selected', 'inline-boundary');
  } else {
    elm.removeAttribute('data-mce-selected');
  }
};

const renderCaretLocation = (editor: Editor, caret: Cell<Text | null>, location: BoundaryLocation.LocationAdt) =>
  BoundaryCaret.renderCaret(caret, location).map((pos) => {
    setCaretPosition(editor, pos);
    return location;
  });

const getPositionFromRange = (range: Range, root: HTMLElement, forward: boolean): CaretPosition => {
  const start = CaretPosition.fromRangeStart(range);
  if (range.collapsed) {
    return start;
  } else {
    const end = CaretPosition.fromRangeEnd(range);
    return forward ? CaretFinder.prevPosition(root, end) ?? (end) : CaretFinder.nextPosition(root, start) ?? (start);
  }
};

const findLocation = (editor: Editor, caret: Cell<Text | null>, forward: boolean) => {
  const rootNode = editor.getBody();
  const from = getPositionFromRange(editor.selection.getRng(), rootNode, forward);
  const isInlineTarget = ((..._rest: any[]) => (InlineUtils.isInlineTarget)(editor, ..._rest));
  const location = BoundaryLocation.findLocation(forward, isInlineTarget, rootNode, from);
  return location.bind((location) => renderCaretLocation(editor, caret, location));
};

const toggleInlines = (isInlineTarget: NodePredicate, dom: DOMUtils, elms: Node[]) => {
  const inlineBoundaries = (SelectorFilter.descendants(SugarElement.fromDom(dom.getRoot()), '*[data-mce-selected="inline-boundary"]')).map((e) => e.dom);
  const selectedInlines = (inlineBoundaries).filter(isInlineTarget);
  const targetInlines = (elms).filter(isInlineTarget);
  ((selectedInlines).filter((_x: any) => !(targetInlines).includes(_x))).forEach(((..._rest: any[]) => (setSelected)(false, ..._rest)));
  ((targetInlines).filter((_x: any) => !(selectedInlines).includes(_x))).forEach(((..._rest: any[]) => (setSelected)(true, ..._rest)));
};

const safeRemoveCaretContainer = (editor: Editor, caret: Cell<Text | null>) => {
  const caretValue = caret.get();
  if (editor.selection.isCollapsed() && !editor.composing && caretValue) {
    const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
    if (CaretPosition.isTextPosition(pos) && !InlineUtils.isAtZwsp(pos)) {
      setCaretPosition(editor, CaretContainerRemove.removeAndReposition(caretValue, pos));
      caret.set(null);
    }
  }
};

const renderInsideInlineCaret = (isInlineTarget: NodePredicate, editor: Editor, caret: Cell<Text | null>, elms: Node[]) => {
  if (editor.selection.isCollapsed()) {
    const inlines = (elms).filter(isInlineTarget);
    (inlines).forEach((_inline) => {
      const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
      BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), pos).bind((location) =>
        renderCaretLocation(editor, caret, location)
      );
    });
  }
};

const move = (editor: Editor, caret: Cell<Text | null>, forward: boolean): boolean =>
  Options.isInlineBoundariesEnabled(editor) ? findLocation(editor, caret, forward) !== null : false;

const moveWord = (forward: boolean, editor: Editor, _caret: Cell<Text | null>) =>
  Options.isInlineBoundariesEnabled(editor) ? WordSelection.moveByWord(forward, editor) : false;

const setupSelectedState = (editor: Editor): Cell<Text | null> => {
  const caret = Cell<Text | null>(null);
  const isInlineTarget = ((..._rest: any[]) => (InlineUtils.isInlineTarget)(editor, ..._rest)) as NodePredicate;

  editor.on('NodeChange', (e) => {
    if (Options.isInlineBoundariesEnabled(editor)) {
      toggleInlines(isInlineTarget, editor.dom, e.parents);
      safeRemoveCaretContainer(editor, caret);
      renderInsideInlineCaret(isInlineTarget, editor, caret, e.parents);
    }
  });

  return caret;
};

const moveNextWord = ((..._rest: any[]) => (moveWord)(true, ..._rest));
const movePrevWord = ((..._rest: any[]) => (moveWord)(false, ..._rest));

const moveToLineEndPoint = (editor: Editor, forward: boolean, caret: Cell<Text | null>): boolean => {
  if (Options.isInlineBoundariesEnabled(editor)) {
    // Try to find the line endpoint, however if one isn't found then assume we're already at the end point
    const linePoint = NavigationUtils.getLineEndPoint(editor, forward).getOrThunk(() => {
      const rng = editor.selection.getRng();
      return forward ? CaretPosition.fromRangeEnd(rng) : CaretPosition.fromRangeStart(rng);
    });

    return BoundaryLocation.readLocation(((..._rest: any[]) => (InlineUtils.isInlineTarget)(editor, ..._rest)), editor.getBody(), linePoint).exists((loc) => {
      const outsideLoc = BoundaryLocation.outside(loc);
      return BoundaryCaret.renderCaret(caret, outsideLoc).exists((pos) => {
        setCaretPosition(editor, pos);
        return true;
      });
    });
  } else {
    return false;
  }
};

export {
  move,
  moveNextWord,
  movePrevWord,
  moveToLineEndPoint,
  setupSelectedState,
  setCaretPosition
};
