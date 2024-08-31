import { UiFinder } from '@hugemce/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@hugemce/katamari';
import { SugarBody } from '@hugemce/sugar';
import { TinyHooks } from '@hugemce/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.InlineEditorSaveTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const assertBogusNotExist = () => {
    UiFinder.findIn(SugarBody.body(), '[data-mce-bogus]').fold(() => {
      throw new Error('Should be data-mce-bogus tags present');
    }, Fun.noop);
  };

  it('Saving inline editor should not remove data-mce-bogus tags', () => {
    const editor = hook.editor();
    editor.setContent('<p data-mce-bogus="all">b</p><p data-mce-bogus="1">b</p>', { format: 'raw' });
    editor.save();
    assertBogusNotExist();
  });
});
