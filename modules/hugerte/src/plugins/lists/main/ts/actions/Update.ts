
import Editor from 'hugerte/core/api/Editor';

import { getParentList } from '../core/Selection';
import { isWithinNonEditableList } from '../core/Util';

interface ListUpdate {
  readonly attrs?: Record<string, string>;
  readonly styles?: Record<string, string>;
}

export const updateList = (editor: Editor, update: ListUpdate): void => {
  const parentList = getParentList(editor);
  if (parentList === null || isWithinNonEditableList(editor, parentList)) {
    return;
  }

  editor.undoManager.transact(() => {
    if ((typeof (update.styles) === 'object' && (update.styles) !== null)) {
      editor.dom.setStyles(parentList, update.styles);
    }
    if ((typeof (update.attrs) === 'object' && (update.attrs) !== null)) {
      Object.entries(update.attrs).forEach(([_k, _v]: [any, any]) => ((v, k) => editor.dom.setAttrib(parentList, k, v))(_v, _k));
    }
  });
};
