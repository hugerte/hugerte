import { Keys, UiFinder } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyHooks, TinySelections, TinyState, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/template/Plugin';

describe('browser.hugerte.plugins.template.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'template',
    toolbar: 'template',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ], true);

  it('TINY-9669: Disable template button on noneditable content', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Insert template"][aria-disabled="true"]');
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Insert template"][aria-disabled="false"]');
    });
  });

  it('TINY-9669: Disable template menuitem on noneditable content', async () => {
    await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Insert template..."][aria-disabled="true"]');
      TinyUiActions.keystroke(editor, Keys.escape());
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Insert template..."][aria-disabled="false"]');
      TinyUiActions.keystroke(editor, Keys.escape());
    });
  });
});

