import { Assertions } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { Insert, SelectorFind, SugarBody, SugarElement } from "@hugerte/sugar";
import { TinyAssertions, TinyDom, TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.init.InitEditorThemeFunctionIframeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    theme: (editor: Editor, target: HTMLElement) => {
      const elm = SugarElement.fromHtml('<div><button>B</button><div></div></div>');

      Insert.after(SugarElement.fromDom(target), elm);

      return {
        editorContainer: elm.dom,
        iframeContainer: elm.dom.lastChild
      };
    },
    base_url: '/project/hugerte/js/hugerte',
    init_instance_callback: (editor: Editor) => {
      editor.dispatch('SkinLoaded');
    }
  }, []);

  it('Tests if the editor is responsive after setting theme to a function', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Editor element properties', () => {
    const editor = hook.editor();
    const body = SugarBody.body();
    const editorElement = SelectorFind.descendant(body, '#' + editor.id + '_parent').getOrDie('No elm');
    const iframeContainerElement = SelectorFind.descendant(body, '#' + editor.id + '_iframecontainer').getOrDie('No elm');

    Assertions.assertDomEq('Should be expected editor container element', editorElement, TinyDom.container(editor));
    Assertions.assertDomEq('Should be expected iframe container element element', iframeContainerElement, TinyDom.contentAreaContainer(editor));
  });
});
