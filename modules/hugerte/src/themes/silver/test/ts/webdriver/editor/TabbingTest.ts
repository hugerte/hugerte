import { RealKeys } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { Focus, Insert, Remove, SugarElement } from "@hugerte/sugar";
import { TinyDom, TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

describe('webdriver.hugerte.themes.silver.editor.TabbingTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/hugerte/js/hugerte',
  }, []);

  it('TINY-3707: Should focus on text editor when tabbing into it', async () => {
    const editor = hook.editor();
    const textInput = SugarElement.fromTag('input');
    const editorElement = TinyDom.targetElement(editor);
    Insert.before(editorElement, textInput);

    Focus.focus(textInput);
    await RealKeys.pSendKeysOn('input', [ RealKeys.text('\t') ]);
    assert.isTrue(editor.hasFocus());

    Remove.remove(textInput);
  });
});
