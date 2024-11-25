import { UiFinder, Waiter } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyHooks, TinySelections } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/quickbars/Plugin';

describe('browser.hugerte.plugins.quickbars.ToolbarFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'quickbars link',
    inline: true,
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: false,
    quickbars_image_toolbar: false,
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  const pAssertToolbarNotVisible = async () => {
    // We can't wait for something to happen, as nothing will change. So instead, just wait some time for when the toolbar would have normally shown
    await Waiter.pWait(50);
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog .tox-toolbar');
  };

  it('TBA: Text selection toolbar is not shown', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><blockquote><p>Some quoted content</p></blockquote>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    await pAssertToolbarNotVisible();
  });

  it('TBA: Insert toolbar is not shown', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><p></p>');
    TinySelections.setCursor(editor, [ 1 ], 0);
    await pAssertToolbarNotVisible();
  });

  it('TBA: Image toolbar is not shown', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"></p>');
    TinySelections.setCursor(editor, [ 0 ], 0);
    await pAssertToolbarNotVisible();
  });
});
