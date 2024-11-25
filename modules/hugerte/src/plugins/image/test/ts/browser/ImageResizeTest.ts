import { Mouse, Waiter } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/image/Plugin';

import { assertCleanHtml, assertInputValue, generalTabSelectors, setInputValue } from '../module/Helpers';

// TODO TINY-10480: Investigate flaky tests
describe.skip('browser.hugerte.plugins.image.ImageResizeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    base_url: '/project/hugerte/js/hugerte',
    file_picker_callback: (callback: (url: string) => void) => {
      // eslint-disable-next-line no-console
      console.log('file picker pressed');
      callback('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    }
  }, [ Plugin ]);

  it('TBA: image proportion constrains should work directly', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(dialog, 'button.tox-browse-url');
    await Waiter.pTryUntil('did not find width input with value 1', () => assertInputValue(generalTabSelectors.width, '1'));
    setInputValue(generalTabSelectors.height, '5');
    await Waiter.pTryUntil('did not find width input with value 5', () => assertInputValue(generalTabSelectors.width, '5'));
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="5" height="5"></p>');
  });
});
