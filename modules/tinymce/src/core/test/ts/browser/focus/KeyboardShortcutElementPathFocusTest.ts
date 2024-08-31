import { FocusTools, Keys } from '@hugemce/agar';
import { context, describe, it } from '@hugemce/bedrock-client';
import { Arr } from '@hugemce/katamari';
import { SugarDocument } from '@hugemce/sugar';
import { TinyContentActions, TinyHooks, TinyUiActions } from '@hugemce/wrap-mcagar';

describe('browser.tinymce.core.focus.KeyboardShortcutElementPathFocusTest ', () => {

  Arr.each([
    { label: 'classic mode', options: {}},
    { label: 'class bottom', options: { toolbar_location: 'bottom' }}
  ], (tester) => {
    context(tester.label, () => {
      const hook = TinyHooks.bddSetup({
        menubar: false,
        ...tester.options,
        base_url: '/project/tinymce/js/tinymce'
      });

      it('TINY-2884: Pressing Alt+F11 focuses the element path and escape from the toolbar will focus the editor', async () => {
        const editor = hook.editor();
        const doc = SugarDocument.getDocument();
        TinyContentActions.keystroke(editor, 122, { alt: true });
        await FocusTools.pTryOnSelector('Assert element path is focused', doc, 'div[role=navigation] .tox-statusbar__path-item');
        TinyUiActions.keystroke(editor, Keys.escape());
      });
    });
  });

});
