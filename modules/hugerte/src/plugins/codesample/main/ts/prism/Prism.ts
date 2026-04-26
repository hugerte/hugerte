
import Prism from 'prismjs';

import Editor from 'hugerte/core/api/Editor';

import * as Options from '../api/Options';

type Prism = typeof Prism;

const get = (editor: Editor): Prism =>
  window.Prism && Options.useGlobalPrismJS(editor) ? window.Prism : Prism;

export {
  get
};
