import Editor from 'hugerte/core/api/Editor';

import { EmojiDatabase } from '../core/EmojiDatabase';
import * as Dialog from '../ui/Dialog';

const register = (editor: Editor, database: EmojiDatabase): void => {
  editor.addCommand('mceEmoticons', () => Dialog.open(editor, database));
};

export {
  register
};
