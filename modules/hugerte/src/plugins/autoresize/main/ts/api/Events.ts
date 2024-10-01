import Editor from 'hugerte/core/api/Editor';
import { EditorEvent } from 'hugerte/core/api/util/EventDispatcher';

const fireResizeEditor = (editor: Editor): EditorEvent<{}> =>
  editor.dispatch('ResizeEditor');

export {
  fireResizeEditor
};
