import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import LinkPlugin from 'hugerte/plugins/link/Plugin';

import { assertContentMenuPosition, pOpenContextMenu } from '../../../module/ContextMenuUtils';

describe('browser.hugerte.themes.silver.editor.contextmenu.ContextMenuPositionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    indent: false,
    height: 200,
    base_url: '/project/hugerte/js/hugerte',
    contextmenu_avoid_overlap: '.mce-spellchecker-word'
  }, [ LinkPlugin ], true);

  it('TINY-6036: Context menu opened on node should open at right click position', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Some <strong>bold</strong> content</p>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    await pOpenContextMenu(editor, 'strong'); // Will trigger from the top right corner of the node
    assertContentMenuPosition(63, -174);
  });

  it('TINY-6036: Context menu opened on "overlap avoid" element should dock to node', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Some <span class="mce-spellchecker-word">invalud</span> word</p>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    await pOpenContextMenu(editor, 'span.mce-spellchecker-word');
    assertContentMenuPosition(63, -154);
  });
});
