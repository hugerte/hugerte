import Editor from 'hugerte/core/api/Editor';
import { EditorOptions } from 'hugerte/core/api/OptionTypes';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const getContentStyle = option('content_style');
const shouldUseContentCssCors = option('content_css_cors');
const getBodyClass = option('body_class');
const getBodyId = option('body_id');

export {
  getContentStyle,
  shouldUseContentCssCors,
  getBodyClass,
  getBodyId
};
