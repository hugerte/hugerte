import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as BlockBoundary from '../caret/BlockBoundary';
import CaretPosition from '../caret/CaretPosition';
import * as IndentOutdent from '../commands/IndentOutdent';

const backspaceDelete = (editor: Editor): (() => void) | null => {
  if (editor.selection.isCollapsed() && IndentOutdent.canOutdent(editor)) {
    const dom = editor.dom;
    const rng = editor.selection.getRng();
    const pos = CaretPosition.fromRangeStart(rng);
    const block = dom.getParent(rng.startContainer, dom.isBlock);
    if (block !== null && BlockBoundary.isAtStartOfBlock(SugarElement.fromDom(block), pos, editor.schema)) {
      return () => IndentOutdent.outdent(editor);
    }
  }

  return null;
};

export {
  backspaceDelete
};
