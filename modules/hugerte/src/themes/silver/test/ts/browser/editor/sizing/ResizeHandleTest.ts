import { FocusTools, Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

const resizeHandleSelector = '.tox-statusbar__resize-handle';

// The custom control has no activation action or single-axis range value.
// Its application role exposes the name and allows assistive technology to pass arrow keys through.
describe('browser.hugerte.themes.silver.editor.sizing.ResizeHandleTest', () => {
  const testResizeMode = (resize: boolean | 'both', label: string) => {
    describe(`resize: ${resize}`, () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/hugerte/js/hugerte',
        resize,
        width: 400,
        height: 400,
        min_width: 300,
        min_height: 300,
        max_width: 500,
        max_height: 500
      }, []);

      it('Has a named, focusable custom keyboard control', () => {
        const editor = hook.editor();
        const handle = UiFinder.findIn(TinyDom.container(editor), resizeHandleSelector).getOrDie();
        assert.equal(Attribute.get(handle, 'role'), 'application');
        assert.equal(Attribute.get(handle, 'aria-label'), label);
        // The editor manages its own tab navigation; keep the existing tabindex.
        assert.equal(Attribute.get(handle, 'tabindex'), '-1');
        assert.equal(Attribute.get(handle, 'data-mce-name'), 'resize-handle');
        FocusTools.setFocus(SugarBody.body(), resizeHandleSelector);
        FocusTools.isOn('Resize handle is focused', handle);
      });

      it('Resizes with arrow keys while retaining focus', () => {
        const editor = hook.editor();
        const container = TinyDom.container(editor);
        const handle = UiFinder.findIn(container, resizeHandleSelector).getOrDie();
        FocusTools.setFocus(SugarBody.body(), resizeHandleSelector);

        TinyUiActions.keystroke(editor, Keys.right());
        assert.equal(container.dom.offsetWidth, resize === 'both' ? 420 : 400);
        TinyUiActions.keystroke(editor, Keys.down());
        assert.equal(container.dom.offsetHeight, 420);
        TinyUiActions.keystroke(editor, Keys.left());
        assert.equal(container.dom.offsetWidth, 400);
        TinyUiActions.keystroke(editor, Keys.up());
        assert.equal(container.dom.offsetHeight, 400);
        FocusTools.isOn('Resize handle remains focused', handle);
      });
    });
  };

  testResizeMode(true, 'Press the Up and Down arrow keys to resize the editor.');
  testResizeMode('both', 'Press the arrow keys to resize the editor.');

  const testNoResizeHandle = (name: string, options: { resize?: boolean; statusbar?: boolean; inline?: boolean }) => {
    describe(name, () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/hugerte/js/hugerte',
        ...options
      }, []);

      it('Does not render a resize control', () => {
        UiFinder.notExists(TinyDom.container(hook.editor()), resizeHandleSelector);
      });
    });
  };

  testNoResizeHandle('resize: false', { resize: false });
  testNoResizeHandle('statusbar: false', { statusbar: false });
  testNoResizeHandle('inline: true', { inline: true });
});
