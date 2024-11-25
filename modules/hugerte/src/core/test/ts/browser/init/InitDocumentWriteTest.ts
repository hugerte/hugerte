import { UiFinder } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.init.InitDocumentWriteTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    init_content_sync: true
  }, [], true);

  it('TINY-9818: Should initialize the editor', () => {
    const editor = hook.editor();
    const ifr = UiFinder.findIn<HTMLIFrameElement>(TinyDom.container(editor), 'iframe').getOrDie();
    assert.isEmpty(ifr.dom.srcdoc, 'Should not have srcdoc set to a non empty string');
    UiFinder.exists(TinyDom.documentElement(editor), 'link');
  });
});

