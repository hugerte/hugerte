import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/template/Plugin';

const dialogSelector = 'div.tox-dialog';
const alertDialogSelector = 'div.tox-dialog.tox-alert-dialog';
const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert template"]';

describe('browser.hugerte.plugins.template.InvalidUrlTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'template',
    toolbar: 'template',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  it('TBA: Test loading in snippet from file that does not exist', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('templates', [{ title: 'invalid', description: 'b', url: '/custom/404' }, { title: 'a', description: 'a', content: '<strong>c</strong>' }]);
    TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
    await TinyUiActions.pWaitForDialog(editor);
    await TinyUiActions.pWaitForPopup(editor, alertDialogSelector);
    // Click on Save button (should be disabled)
    TinyUiActions.clickOnUi(editor, 'button.tox-button:contains(OK)');
    await Waiter.pTryUntil('Alert dialog should close', () => UiFinder.notExists(SugarBody.body(), alertDialogSelector));
    TinyUiActions.submitDialog(editor);
    await Waiter.pTryUntil('Dialog should not close', () => UiFinder.exists(SugarBody.body(), dialogSelector));
    TinyUiActions.cancelDialog(editor);
    await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
    TinyAssertions.assertContent(editor, '');
  });
});
