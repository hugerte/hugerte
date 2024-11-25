import { describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarElement } from "@hugerte/sugar";
import { McEditor, TinyDom } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.init.InitIframeAriaTextTest', () => {
  const defaultIframeTitle = 'Rich Text Area. Press ALT-0 for help.';
  const customIframeTitle = 'Cupidatat magna aliquip.';

  it('TINY-1264: Should use the default iframe title when iframe_aria_text is not set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/hugerte/js/hugerte'
    });
    const iframe = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    const iframeBody = TinyDom.body(editor);
    assert.equal(Attribute.get(iframe, 'title'), 'Rich Text Area');
    assert.equal(Attribute.get(iframeBody, 'aria-label'), defaultIframeTitle);
    McEditor.remove(editor);
  });

  it('TINY-1264: Should use iframe_aria_text as the iframe title', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/hugerte/js/hugerte',
      iframe_aria_text: customIframeTitle
    });
    const iframe = SugarElement.fromDom(editor.iframeElement as HTMLIFrameElement);
    const iframeBody = TinyDom.body(editor);
    assert.equal(Attribute.get(iframe, 'title'), 'Rich Text Area');
    assert.equal(Attribute.get(iframeBody, 'aria-label'), customIframeTitle);
    McEditor.remove(editor);
  });
});
