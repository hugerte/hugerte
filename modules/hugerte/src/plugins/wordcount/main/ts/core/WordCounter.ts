import { Throttler } from "@hugerte/katamari";

import Editor from 'hugerte/core/api/Editor';
import Delay from 'hugerte/core/api/util/Delay';

import { WordCountApi } from '../api/Api';
import * as Events from '../api/Events';

const updateCount = (editor: Editor, api: WordCountApi): void => {
  Events.fireWordCountUpdate(editor, api);
};

const setup = (editor: Editor, api: WordCountApi, delay: number): void => {
  const debouncedUpdate = Throttler.first(() => updateCount(editor, api), delay);

  editor.on('init', () => {
    updateCount(editor, api);
    Delay.setEditorTimeout(editor, () => {
      editor.on('SetContent BeforeAddUndo Undo Redo ViewUpdate keyup', debouncedUpdate.throttle);
    }, 0);
    editor.on('remove', debouncedUpdate.cancel);
  });
};

export {
  setup,
  updateCount
};
