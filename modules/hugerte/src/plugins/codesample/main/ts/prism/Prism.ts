import { Global } from "@hugerte/katamari";
import Prism from 'prismjs';

import Editor from 'hugerte/core/api/Editor';

import * as Options from '../api/Options';

type Prism = typeof Prism;

const get = (editor: Editor): Prism =>
  Global.Prism && Options.useGlobalPrismJS(editor) ? Global.Prism : Prism;

export {
  get
};
