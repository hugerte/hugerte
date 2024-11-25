import { UiFinder, Waiter } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyAssertions, TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/anchor/Plugin';

import { pAddAnchor } from '../module/Helpers';

describe('browser.hugerte.plugins.anchor.AnchorAlertTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);
  const dialogSelector = 'div[role="dialog"].tox-dialog';
  const alertDialogSelector = 'div[role="dialog"].tox-dialog.tox-alert-dialog';

  it('TINY-2788: Add anchor with invalid id, check alert appears', async () => {
    const editor = hook.editor();
    editor.setContent('');
    await pAddAnchor(editor, '');
    await TinyUiActions.pWaitForDialog(editor, alertDialogSelector);
    TinyUiActions.clickOnUi(editor, 'button.tox-button:contains(OK)');
    await Waiter.pTryUntil('Alert dialog should close', () => UiFinder.notExists(SugarBody.body(), alertDialogSelector));
    await Waiter.pTryUntil('Anchor Dialog should not close', () => UiFinder.exists(SugarBody.body(), dialogSelector));
    TinyUiActions.clickOnUi(editor, 'button.tox-button:contains(Cancel)');
    await Waiter.pTryUntil('Anchor Dialog should close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
    TinyAssertions.assertContent(editor, '');
  });
});
