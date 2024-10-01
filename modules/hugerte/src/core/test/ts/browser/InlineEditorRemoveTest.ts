import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.InlineEditorRemoveTest', () => {

  const settings = {
    inline: true,
    base_url: '/project/hugerte/js/hugerte'
  };

  const assertBogusNotExist = () => {
    UiFinder.findIn(SugarBody.body(), '[data-mce-bogus]').each(() => {
      throw new Error('Should not be any data-mce-bogus tags present');
    });
  };

  it('Removing inline editor should remove all data-mce-bogus tags', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    editor.setContent('<p data-mce-bogus="all">b</p><p data-mce-bogus="1">b</p>', { format: 'raw' });
    editor.remove();
    assertBogusNotExist();
    McEditor.remove(editor);
  });
});
