import { FocusTools, Keys } from "@hugerte/agar";
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from "@hugerte/sugar";
import { McEditor, TinyContentActions, TinyDom, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import { RawEditorOptions } from 'hugerte/core/api/OptionTypes';

describe('browser.hugerte.themes.silver.editor.toolbar.ToolbarFocusTest', () => {

  const pTestFocus = async (options: RawEditorOptions) => {
    const editor = await McEditor.pFromSettings<Editor>({
      toolbar: 'undo redo | bold italic',
      menubar: false,
      statusbar: false,
      ...options,
      base_url: '/project/hugerte/js/hugerte'
    });
    editor.focus();
    const editorDoc = TinyDom.document(editor);
    const doc = SugarDocument.getDocument();

    // Press the Alt+F10 key
    TinyContentActions.keystroke(editor, 121, { alt: true });
    await FocusTools.pTryOnSelector('Assert toolbar is focused', doc, 'div[role=toolbar] .tox-tbtn');
    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('Assert editor is focused', doc, 'iframe');
    await FocusTools.pTryOnSelector('Assert editor is focused', editorDoc, 'body');
    McEditor.remove(editor);
  };

  context('Pressing Alt+F10 focuses the toolbar and escape from the toolbar will focus the editor', () => {
    it('TINY-6230: Floating toolbar', () =>
      pTestFocus({ toolbar_mode: 'floating' })
    );

    it('TINY-6230: Sliding toolbar', () =>
      pTestFocus({ toolbar_mode: 'sliding' })
    );

    it('TINY-6230: Wrap toolbar', () =>
      pTestFocus({ toolbar_mode: 'wrap' })
    );

    it('TINY-6230: Multiple toolbars', () =>
      pTestFocus({ toolbar: [ 'undo redo', 'bold italic' ] })
    );
  });
});
