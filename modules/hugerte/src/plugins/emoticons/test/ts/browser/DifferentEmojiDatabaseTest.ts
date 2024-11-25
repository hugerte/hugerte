import { UiFinder, Waiter } from "@hugerte/agar";
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from "@hugerte/katamari";
import { SugarBody } from "@hugerte/sugar";
import { McEditor, TinyUiActions } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/emoticons/Plugin';

const getFilename = (url: string) => {
  const m = /([^\/\\]+)$/.exec(url);
  if (m !== null) {
    return m[1];
  }
  return '';
};

describe('browser.hugerte.plugins.emoticons.DifferentEmojiDatabaseTest', () => {
  before(() => {
    Plugin();
  });

  const pTestEditorWithSettings = async (categories: string[], databaseUrl: string) => {
    const editor = await McEditor.pFromSettings<Editor>({
      plugins: 'emoticons',
      toolbar: 'emoticons',
      base_url: '/project/hugerte/js/hugerte',
      emoticons_database_url: databaseUrl,
      emoticons_database_id: 'hugerte.plugins.emoticons.' + getFilename(databaseUrl)
    });

    TinyUiActions.clickOnToolbar(editor, 'button');
    await TinyUiActions.pWaitForDialog(editor);
    await Waiter.pTryUntil(
      'Wait for emojis to load',
      () => UiFinder.notExists(SugarBody.body(), '.tox-spinner')
    );

    const tabs = UiFinder.findAllIn(SugarBody.body(), '[role="tab"]');
    const actualCategories = Arr.map(tabs, (elm) => elm.dom.textContent);
    assert.deepEqual(actualCategories, categories, 'Categories match');
    McEditor.remove(editor);
  };

  it('TBA: Loading databases from different urls ', async () => {
    await pTestEditorWithSettings([ 'All', 'People' ], '/project/hugerte/src/plugins/emoticons/test/js/test-emojis.js');
    await pTestEditorWithSettings([ 'All', 'Travel and Places' ], '/project/hugerte/src/plugins/emoticons/test/js/test-emojis-alt.js');
  });
});
