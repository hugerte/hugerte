import { Keys, UiFinder } from "@hugerte/agar";
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyHooks, TinySelections, TinyState, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.themes.silver.editor.color.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    menubar: 'format',
    toolbar: 'forecolor backcolor',
  }, []);

  context('Noneditable root buttons', () => {
    const testDisableButtonOnNoneditable = (title: string) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label^="${title}"][aria-disabled="true"]`);
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label^="${title}"][aria-disabled="false"]`);
      });
    };

    it('TINY-9669: Disable forecolor on noneditable content', testDisableButtonOnNoneditable('Text color'));
    it('TINY-9669: Disable backcolor on noneditable content', testDisableButtonOnNoneditable('Background color'));
  });

  context('Noneditable root menuitems', () => {
    const testDisableMenuitemOnNoneditable = (menu: string, menuitem: string) => async () => {
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, `button:contains("${menu}")`);
        await TinyUiActions.pWaitForUi(editor, `[role="menu"] [aria-label^="${menuitem}"][aria-disabled="true"]`);
        TinyUiActions.keystroke(editor, Keys.escape());
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, `button:contains("${menu}")`);
        await TinyUiActions.pWaitForUi(editor, `[role="menu"] [aria-label^="${menuitem}"][aria-disabled="false"]`);
        TinyUiActions.keystroke(editor, Keys.escape());
      });
    };

    it('TINY-9669: Disable forecolor on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Text color'));
    it('TINY-9669: Disable backcolor on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Background color'));
  });
});
