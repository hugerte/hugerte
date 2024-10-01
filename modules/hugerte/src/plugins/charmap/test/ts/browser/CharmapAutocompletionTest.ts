import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/charmap/Plugin';

describe('browser.hugerte.plugins.charmap.AutocompletionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'charmap',
    toolbar: 'charmap',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ], true);

  it('TBA: Autocomplete, trigger an autocomplete and check it appears', async () => {
    const editor = hook.editor();
    editor.setContent('<p>:co</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    editor.dispatch('input');
    await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter');
    TinyContentActions.keydown(editor, Keys.enter());
  });
});
