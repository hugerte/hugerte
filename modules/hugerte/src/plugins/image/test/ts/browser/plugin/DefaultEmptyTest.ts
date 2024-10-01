import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/image/Plugin';

import { assertCleanHtml, assertInputValue, fillActiveDialog, generalTabSelectors } from '../../module/Helpers';

describe('browser.hugerte.plugins.image.plugin.DefaultEmptyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    indent: false,
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  it('TBA: default image dialog on empty data', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);

    assertInputValue(generalTabSelectors.src, '');
    assertInputValue(generalTabSelectors.alt, '');
    assertInputValue(generalTabSelectors.height, '');
    assertInputValue(generalTabSelectors.width, '');

    fillActiveDialog({
      src: {
        value: 'src'
      },
      alt: 'alt',
      dimensions: {
        width: '200',
        height: '100'
      }
    });
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="src" alt="alt" width="200" height="100"></p>');
  });
});
