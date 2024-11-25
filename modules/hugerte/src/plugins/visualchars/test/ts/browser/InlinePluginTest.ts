import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/visualchars/Plugin';

describe('browser.hugerte.plugins.visualchars.InlinePluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  it('TINY-6282: Editor should not steal focus when loaded inline with visualchars', () => {
    const editor = hook.editor();
    assert.isFalse(editor.hasFocus()); // NOTE: This is all we need to test.

    // The following is to assert the visualchars plugin exists and is initialised. This ensures we are testing the correct case.
    editor.setContent('<p>a&nbsp;&nbsp;b</p>');
    TinyAssertions.assertContentPresence(
      editor,
      { p: 1, span: 0 }
    );

    editor.execCommand('mceVisualChars');
    TinyAssertions.assertContentPresence(
      editor,
      { p: 1, span: 2 }
    );
  });
});
