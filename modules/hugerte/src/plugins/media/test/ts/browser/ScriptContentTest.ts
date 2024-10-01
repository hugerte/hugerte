import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/media/Plugin';

describe('browser.hugerte.plugins.media.core.ScriptContentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [
      'media'
    ],
    toolbar: 'media',
    custom_elements: 'script',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  it('TINY-10007: Scripts are not changed into images by the media plugin', () => {
    const editor = hook.editor();
    editor.setContent('<p>Normal</p><script>let a = 1;</script>');
    TinyAssertions.assertRawContent(editor, '<p>Normal</p><script type="mce-no/type">let a = 1;</script>');
  });
});
