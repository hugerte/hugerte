import { Assertions } from '@hugemce/agar';
import { describe, it } from '@hugemce/bedrock-client';
import { TinyHooks } from '@hugemce/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Options from 'tinymce/themes/silver/api/Options';

describe('browser.tinymce.themes.silver.editor.ShadowDomInlineTest', () => {
  const hook = TinyHooks.bddSetupInShadowRoot<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    inline: true
  }, []);

  it('UI container should be inside the shadow root', () => {
    const editor = hook.editor();
    Assertions.assertDomEq('Should be shadow root', hook.shadowRoot(), Options.getUiContainer(editor));
  });
});
