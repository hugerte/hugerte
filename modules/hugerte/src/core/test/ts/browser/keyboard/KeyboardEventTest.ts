import { Keys } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.keyboard.KeyboardEventTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/hugerte/js/hugerte'
  }, []);

  it('TINY-10263: getModifierState exists and does not crash the editor', () => {
    const editor = hook.editor();
    let eventFired = 0;

    editor.on('keydown', (e) => {
      eventFired++;
      e.getModifierState('Shift');
    });

    TinyContentActions.keystroke(editor, Keys.enter());
    assert.equal(eventFired, 1);
  });
});
