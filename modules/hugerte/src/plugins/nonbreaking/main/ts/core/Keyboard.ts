import Editor from 'hugerte/core/api/Editor';
import VK from 'hugerte/core/api/util/VK';

import * as Options from '../api/Options';
import * as Actions from './Actions';

const setup = (editor: Editor): void => {
  const spaces = Options.getKeyboardSpaces(editor);

  if (spaces > 0) {
    editor.on('keydown', (e) => {
      if (e.keyCode === VK.TAB && !e.isDefaultPrevented()) {
        if (e.shiftKey) {
          return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        Actions.insertNbsp(editor, spaces);
      }
    });
  }
};

export {
  setup
};
