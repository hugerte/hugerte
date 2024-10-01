import { Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/link/Plugin';

describe('browser.hugerte.plugins.link.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'link',
    toolbar: 'link unlink openlink',
    menu: {
      insert: { title: 'Insert', items: 'link unlink' }
    },
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ], true);

  it('TINY-9669: Disable link button on noneditable content', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Insert/edit link"][aria-disabled="true"]');
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Insert/edit link"][aria-disabled="false"]');
    });
  });

  it('TINY-9669: Disable unlink button on noneditable content', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div><a href="#">Noneditable content</a></div><div contenteditable="true"><a href="#">Editable content</a></div>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Remove link"][aria-disabled="true"]');
      TinySelections.setSelection(editor, [ 1, 0, 0 ], 0, [ 1, 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Remove link"][aria-disabled="false"]');
    });
  });

  it('TINY-9669: Disable link menuitem on noneditable content', async () => {
    await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Link..."][aria-disabled="true"]');
      TinyUiActions.keystroke(editor, Keys.escape());
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Link..."][aria-disabled="false"]');
      TinyUiActions.keystroke(editor, Keys.escape());
    });
  });

  it('TINY-9669: Disable unlink menuitem on noneditable content', async () => {
    await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
      editor.setContent('<div><a href="#">Noneditable content</a></div><div contenteditable="true"><a href="#">Editable content</a></div>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Remove link"][aria-disabled="true"]');
      TinyUiActions.keystroke(editor, Keys.escape());
      TinySelections.setSelection(editor, [ 1, 0, 0 ], 0, [ 1, 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Remove link"][aria-disabled="false"]');
      TinyUiActions.keystroke(editor, Keys.escape());
    });
  });
});

