import { UiFinder } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from "@hugerte/katamari";
import { SugarBody } from "@hugerte/sugar";
import { TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.InlineEditorSaveTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
    base_url: '/project/hugerte/js/hugerte'
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
