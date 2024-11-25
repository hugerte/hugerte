import { Mouse, UiFinder, Waiter } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from "@hugerte/katamari";
import { SugarShadowDom } from "@hugerte/sugar";
import { TinyDom, TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/image/Plugin';

describe('browser.hugerte.plugins.link.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'link',
    toolbar: '',
    indent: false,
    base_url: '/project/hugerte/js/hugerte',
    setup: (editor: Editor) => {
      editor.ui.registry.addMenuItem('contextfiller', {
        icon: 'link',
        text: 'Context Filler',
        onAction: Fun.noop
      });

      editor.ui.registry.addContextMenu('contextfiller', {
        update: Fun.constant('contextfiller')
      });
    },
    contextmenu: 'link contextfiller',
    image_caption: true
  }, [ Plugin ], true);

  const pOpenContextMenu = async (editor: Editor, target: string) => {
    // Not sure why this is needed, but without the browser deselects the contextmenu target
    await Waiter.pWait(0);
    await TinyUiActions.pTriggerContextMenu(editor, target, '.tox-silver-sink [role="menuitem"]');
  };

  it('TINY-9491: Opening context menu on a cef', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<div contenteditable="false"><a href="#target">Target</a></div>',
      { format: 'raw' }
    );
    Mouse.contextMenuOn(TinyDom.body(editor), 'a');
    await pOpenContextMenu(editor, 'a');
    UiFinder.notExists(SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor))), 'div[aria-label="Link..."');
  });

  it('TINY-9491: Opening context not on a cef', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<div contenteditable="true"><a href="#target">Target</a></div>',
      { format: 'raw' }
    );
    Mouse.contextMenuOn(TinyDom.body(editor), 'a');
    await pOpenContextMenu(editor, 'a');
    UiFinder.exists(SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor))), 'div[aria-label="Link..."');
  });
});
