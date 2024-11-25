import { Keys } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/save/Plugin';

describe('browser.hugerte.plugins.save.SaveSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'save',
    toolbar: 'save',
    base_url: '/project/hugerte/js/hugerte',
  }, [ Plugin ]);

  it('TBA: Assert Save button is disabled when editor is opened.', async () => {
    const editor = hook.editor();
    // button is disabled
    await TinyUiActions.pWaitForUi(editor, 'button.tox-tbtn--disabled[aria-label="Save"]');
  });

  it('TBA: Add content and assert Save button is enabled.', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    TinyContentActions.keystroke(editor, Keys.enter());
    // button no longer disabled
    await TinyUiActions.pWaitForUi(editor, 'button[aria-label="Save"]:not(.tox-tbtn--disabled)');
  });
});
