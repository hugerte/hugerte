import { Keys } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinySelections } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/autolink/Plugin';

describe('browser.hugerte.plugins.autolink.EnterKeyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autolink',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ], true);

  it('TINY-1202: Focus on editor, set content, set cursor at end of content, assert enter/return keystroke and keydown event', () => {
    const editor = hook.editor();
    editor.setContent('<p>abcdefghijk</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 'abcdefghijk'.length);
    TinyContentActions.keydown(editor, Keys.enter());
    assert.doesNotThrow(() => {
      editor.dispatch('keydown', { keyCode: Keys.enter() } as KeyboardEvent);
    }, 'should not throw error');
  });
});
