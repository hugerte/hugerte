import { Keys, UiFinder, Waiter } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/preview/Plugin';

describe('browser.hugerte.plugins.preview.PreviewSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'preview',
    toolbar: 'preview',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  const dialogSelector = 'div[role="dialog"]';
  const docBody = SugarBody.body();

  const pOpenDialog = async (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, 'button');
    await TinyUiActions.pWaitForDialog(editor, '[role="dialog"] iframe');
  };

  it('TBA: Open dialog, click Close to close dialog', async () => {
    const editor = hook.editor();
    editor.setContent('<strong>a</strong>');
    await pOpenDialog(editor);
    TinyUiActions.closeDialog(editor);
    await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(docBody, dialogSelector));

  });

  it('TBA: Open dialog, press escape to close dialog', async () => {
    const editor = hook.editor();
    editor.setContent('<strong>a</strong>');
    await pOpenDialog(editor);
    TinyUiActions.keyup(editor, Keys.escape());
    await Waiter.pTryUntil('Dialog should close on esc', () => UiFinder.notExists(docBody, dialogSelector));
  });
});
