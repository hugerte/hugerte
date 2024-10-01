import Editor from 'hugerte/core/api/Editor';

import * as Actions from '../core/Actions';

const register = (editor: Editor): void => {
  editor.addCommand('mceNonBreaking', () => {
    Actions.insertNbsp(editor, 1);
  });
};

export {
  register
};
