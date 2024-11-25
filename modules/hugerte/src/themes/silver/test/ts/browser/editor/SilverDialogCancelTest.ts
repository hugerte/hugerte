import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.themes.silver.editor.SilverDialogCancelTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.windowManager.open({
          title: 'test',
          body: {
            type: 'panel',
            items: []
          },
          buttons: [
            {
              type: 'cancel',
              name: 'cancel',
              text: 'Cancel'
            }
          ]
        });
      });
    }
  }, []);

  it('Dialog closes without error using cancel button', async () => {
    const editor = hook.editor();
    await TinyUiActions.pWaitForDialog(editor, 'div[role="dialog"].tox-dialog');
    TinyUiActions.cancelDialog(editor);
  });
});
