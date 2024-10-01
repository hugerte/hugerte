import { describe, it } from '@ephox/bedrock-client';
import { Class, Traverse } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.themes.silver.editor.ToxWrappingTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    menubar: true,
    base_url: '/project/hugerte/js/hugerte'
  }, []);

  it('Check editor container has tox-hugerte wrapper', () => {
    const editor = hook.editor();
    const elem = TinyDom.targetElement(editor);
    const container = Traverse.nextSibling(elem).getOrDie('Replaced element has no next sibling');
    const hasToxWrapper = Class.has(container, 'tox-hugerte');
    assert.isTrue(hasToxWrapper, `Replaced element's next sibling has "tox-hugerte" class`);
  });
});
