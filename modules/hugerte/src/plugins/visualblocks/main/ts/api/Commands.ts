import { Cell } from "@hugerte/katamari";

import Editor from 'hugerte/core/api/Editor';

import * as VisualBlocks from '../core/VisualBlocks';

const register = (editor: Editor, pluginUrl: string, enabledState: Cell<boolean>): void => {
  editor.addCommand('mceVisualBlocks', () => {
    VisualBlocks.toggleVisualBlocks(editor, pluginUrl, enabledState);
  });
};

export {
  register
};
