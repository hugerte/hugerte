import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import { isAfterMedia, isBeforeMedia } from '../caret/CaretPositionPredicates';
import * as CaretUtils from '../caret/CaretUtils';
import { HDirection } from '../caret/CaretWalker';
import * as NodeType from '../dom/NodeType';
import * as InlineUtils from '../keyboard/InlineUtils';
import * as DeleteElement from './DeleteElement';

const deleteElement = (editor: Editor, forward: boolean, element: Node | undefined): (() =) | null void> => {
  if ((element) != null) {
    return () => {
      editor._selectionOverrides.hideFakeCaret();
      DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(element));
    };
  } else {
    return null;
  }
};

const deleteCaret = (editor: Editor, forward: boolean): (() =) | null void> => {
  const isNearMedia = forward ? isBeforeMedia : isAfterMedia;
  const direction = forward ? HDirection.Forwards : HDirection.Backwards;
  const fromPos = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), editor.selection.getRng());

  if (isNearMedia(fromPos)) {
    return deleteElement(editor, forward, fromPos.getNode(!forward));
  } else {
    return (InlineUtils.normalizePosition(forward, fromPos) ?? null)
      .filter((pos) => isNearMedia(pos) && CaretUtils.isMoveInsideSameBlock(fromPos, pos))
      .bind((pos) => deleteElement(editor, forward, pos.getNode(!forward)));
  }
};

const deleteRange = (editor: Editor, forward: boolean): (() =) | null void> => {
  const selectedNode = editor.selection.getNode();
  return NodeType.isMedia(selectedNode) ? deleteElement(editor, forward, selectedNode) : null;
};

const backspaceDelete = (editor: Editor, forward: boolean): (() =) | null void> =>
  editor.selection.isCollapsed() ? deleteCaret(editor, forward) : deleteRange(editor, forward);

export {
  backspaceDelete
};
