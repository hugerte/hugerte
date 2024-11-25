import { FocusTools, Keys } from "@hugerte/agar";
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from "@hugerte/katamari";
import { SugarDocument } from "@hugerte/sugar";
import { TinyContentActions, TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

describe('browser.hugerte.core.focus.KeyboardShortcutElementPathFocusTest ', () => {

  Arr.each([
    { label: 'classic mode', options: {}},
    { label: 'class bottom', options: { toolbar_location: 'bottom' }}
  ], (tester) => {
    context(tester.label, () => {
      const hook = TinyHooks.bddSetup({
        menubar: false,
        ...tester.options,
        base_url: '/project/hugerte/js/hugerte'
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
