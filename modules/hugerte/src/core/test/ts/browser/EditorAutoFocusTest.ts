import { context, describe, it, before, afterEach, after } from '@ephox/bedrock-client';
import { Arr } from "@hugerte/katamari";
import { Insert, Remove, Selectors, SugarBody, SugarElement } from "@hugerte/sugar";
import { assert } from 'chai';

import 'hugerte';
import Editor from 'hugerte/core/api/Editor';
import EditorManager from 'hugerte/core/api/EditorManager';
import { RawEditorOptions } from 'hugerte/core/api/OptionTypes';

// TODO TINY-10480: Investigate flaky tests
describe.skip('browser.hugerte.core.EditorAutoFocusTest', () => {
  before(() => {
    Insert.append(SugarBody.body(), SugarElement.fromHtml(`<div id="abc">
      <div class="hugerte" id="mce_0">Editor_0</div>
      <div style="margin-top: ${window.innerHeight}px"><div class="hugerte" id="mce_1">Editor_1</div></div>
      <div style="margin-top: ${window.innerHeight}px"><div class="hugerte" id="mce_2">Editor_2</div></div>
    </div>`));
  });

  after(() => {
    Selectors.one('#abc').each(Remove.remove);
  });

  afterEach(() => {
    window.scrollTo(0, 0);
    EditorManager.remove();
  });

  const restOfWindowHeight = () =>
    window.innerHeight - SugarBody.body().dom.getBoundingClientRect().height;

  const isInViewport = (editor: Editor) => {
    const { top } = editor.getContainer().getBoundingClientRect();
    return top > 0 && top + 50 < window.innerHeight;
  };

  const pSetupEditorAutoFocus = (id: string, options: RawEditorOptions) => {
    const height = restOfWindowHeight();
    return new Promise((resolve) => {
      EditorManager.init({
        selector: 'div.hugerte',
        base_url: '/project/hugerte/js/hugerte/',
        menubar: false,
        statusbar: false,
        height,
        auto_focus: id,
        init_instance_callback: (editor: Editor) => {
          editor.on('focus', resolve);
        },
        ...options
      });
    });
  };

  const pTestEditorAutoFocus = async (id: string, options: RawEditorOptions) => {
    await pSetupEditorAutoFocus(id, options);
    const editor = EditorManager.get(id) as Editor;
    assert.isTrue(editor.hasFocus());
    assert.isTrue(isInViewport(editor));
  };

  Arr.each([
    { label: 'Iframe Editor', settings: {}},
    { label: 'Inline Editor', settings: { inline: true }},
  ], (tester) => {
    context(tester.label, () => {
      it('TINY-8785: should autofocus the first editor and skip scrolling', async () => {
        await pTestEditorAutoFocus('mce_0', tester.settings);
        assert.equal(window.scrollY, 0);
      });

      it('TINY-8785: should autofocus the second editor', async () => {
        await pTestEditorAutoFocus('mce_1', tester.settings);
        assert.isAtLeast(window.scrollY, 10);
      });

      it('TINY-8785: should autofocus the third editor', async () => {
        await pTestEditorAutoFocus('mce_2', tester.settings);
        assert.isAtLeast(window.scrollY, 10);
      });
    });
  });
});
