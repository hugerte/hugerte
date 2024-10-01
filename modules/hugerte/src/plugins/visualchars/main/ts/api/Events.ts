import Editor from 'hugerte/core/api/Editor';
import { EditorEvent } from 'hugerte/core/api/util/EventDispatcher';

const fireVisualChars = (editor: Editor, state: boolean): EditorEvent<{ state: boolean }> => {
  return editor.dispatch('VisualChars', { state });
};

export {
  fireVisualChars
};
