import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import { EmojiEntry } from 'hugerte/plugins/emoticons/core/EmojiDatabase';
import Plugin from 'hugerte/plugins/emoticons/Plugin';

describe('browser.hugerte.plugins.emoticons.EmoticonsPluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'emoticons',
    toolbar: 'emoticons',
    base_url: '/project/hugerte/js/hugerte',
    emoticons_database_url: '/project/hugerte/src/plugins/emoticons/main/js/emojis.js'
  }, [ Plugin ], true);

  it('TINY-10572: The plugin successfully exports the promise function that gives emojis', async () => {
    const editor = hook.editor();
    await editor.plugins.emoticons.getAllEmojis().then((result: EmojiEntry[]) => assert.isArray(result));
  });
});
