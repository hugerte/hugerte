import Editor from 'hugerte/core/api/Editor';
import { EditorEvent } from 'hugerte/core/api/util/EventDispatcher';

const fireInsertCustomChar = (editor: Editor, chr: string): EditorEvent<{ chr: string }> => {
  return editor.dispatch('insertCustomChar', { chr });
};

export {
  fireInsertCustomChar
};
