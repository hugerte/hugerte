
import Editor from 'hugerte/core/api/Editor';
import { NodeChangeEvent } from 'hugerte/core/api/EventTypes';

import * as Selection from '../core/Selection';
import * as NodeType from './NodeType';

const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

const inList = (parents: Node[], listName: string): boolean =>
  ((_xs: any, _pred: any, _until: any) => { for (let _i = 0; _i < _xs.length; _i++) { const _x = _xs[_i]; if (_pred(_x, _i)) return _x; if (_until(_x, _i)) break; } return null; })(parents, NodeType.isListNode, NodeType.isTableCellNode)
    .exists((list) => list.nodeName === listName && !isCustomList(list));

// Advlist/core/ListUtils.ts - Duplicated in Advlist plugin
const isWithinNonEditable = (editor: Editor, element: Element | null): boolean =>
  element !== null && !editor.dom.isEditable(element);

const selectionIsWithinNonEditableList = (editor: Editor): boolean => {
  const parentList = Selection.getParentList(editor);
  return isWithinNonEditable(editor, parentList);
};

const isWithinNonEditableList = (editor: Editor, element: Element | null): boolean => {
  const parentList = editor.dom.getParent(element, 'ol,ul,dl');
  return isWithinNonEditable(editor, parentList);
};

const setNodeChangeHandler = (editor: Editor, nodeChangeHandler: (e: NodeChangeEvent) => void): () => void => {
  const initialNode = editor.selection.getNode();
  // Set the initial state
  nodeChangeHandler({
    parents: editor.dom.getParents(initialNode),
    element: initialNode
  });
  editor.on('NodeChange', nodeChangeHandler);
  return () => editor.off('NodeChange', nodeChangeHandler);
};

export {
  isCustomList,
  inList,
  selectionIsWithinNonEditableList,
  isWithinNonEditableList,
  setNodeChangeHandler
};
