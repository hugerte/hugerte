import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/emoticons/Plugin';

describe('browser.hugerte.plugins.emoticons.EmoticonAutocompletionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'emoticons',
    toolbar: 'emoticons',
    base_url: '/project/hugerte/js/hugerte',
    emoticons_database_url: '/project/hugerte/src/plugins/emoticons/test/js/test-emojis.js',
    emoticons_database_id: 'hugerte.plugins.emoticons.test-emojis.js'
  }, [ Plugin ], true);

  // NOTE: This is almost identical to charmap
  it('TBA: Autocomplete, trigger an autocomplete and check it appears', async () => {
    const editor = hook.editor();
    editor.setContent('<p>:ha</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    editor.dispatch('input');
    await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter .tox-collection__item');
    TinyContentActions.keydown(editor, Keys.right());
    TinyContentActions.keydown(editor, Keys.right());
    TinyContentActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p>😂</p>');
  });
});
