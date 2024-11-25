import { Assertions } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { SelectorFind, SugarBody, Traverse } from "@hugerte/sugar";
import { TinyAssertions, TinyDom, TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.init.InitEditorNoThemeIframeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    theme: false,
    base_url: '/project/hugerte/js/hugerte',
    init_instance_callback: (editor: Editor) => {
      editor.dispatch('SkinLoaded');
    }
  }, []);

  it('Tests if the editor is responsive after setting theme to false', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Editor element properties', () => {
    const editor = hook.editor();
    const body = SugarBody.body();
    const targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
    const editorElement = Traverse.nextSibling(targetElement).getOrDie('No elm');

    Assertions.assertDomEq('Should be expected element', editorElement, TinyDom.container(editor));
    Assertions.assertDomEq('Should be expected element', editorElement, TinyDom.contentAreaContainer(editor));
    Assertions.assertDomEq('Should be expected element', targetElement, TinyDom.targetElement(editor));
  });
});
