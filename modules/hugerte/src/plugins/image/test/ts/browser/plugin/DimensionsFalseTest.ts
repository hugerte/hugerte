import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/image/Plugin';

import { assertCleanHtml, fillActiveDialog } from '../../module/Helpers';

describe('browser.hugerte.plugins.image.plugin.DimensionsFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    indent: false,
    base_url: '/project/hugerte/js/hugerte',
    image_dimensions: false
  }, [ Plugin ]);

  it('TBA: image dialog image_dimensions: false', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);

    fillActiveDialog({
      src: {
        value: 'src'
      },
      alt: 'alt'
    });
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="src" alt="alt"></p>');
  });
});
