import { RealMouse, Waiter } from "@hugerte/agar";
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

describe('webdriver.hugerte.core.paste.CutTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    toolbar: false,
    statusbar: false
  }, []);

  it('TBA: Set and select content, cut using edit menu and assert cut content', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
    await RealMouse.pClickOn('div[aria-label="Cut"]');
    await Waiter.pTryUntil('Cut is async now, so need to wait for content', () => TinyAssertions.assertContent(editor, '<p>ac</p>'));
  });

  context('TINY-10385: cutting text at the first level with `valid_elements` `*[*]` should not make the editor crash', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/hugerte/js/hugerte',
      toolbar: false,
      statusbar: false,
      valid_elements: '*[*]'
    }, []);

    it('TINY-10385: Set and select content, cut using edit menu and assert cut content', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
      await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
      await RealMouse.pClickOn('div[aria-label="Cut"]');
      await Waiter.pTryUntil('Cut is async now, so need to wait for content', () => TinyAssertions.assertContent(editor, '<p>ac</p>'));
    });
  });
});
