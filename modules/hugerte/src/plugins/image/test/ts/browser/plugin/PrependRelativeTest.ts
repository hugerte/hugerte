import { UiFinder } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/image/Plugin';

import { assertCleanHtml, fakeEvent, fillActiveDialog, generalTabSelectors } from '../../module/Helpers';

describe('browser.hugerte.plugins.image.plugin.PrependRelativeTest', () => {
  const prependUrl = 'testing/images/';
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    indent: false,
    base_url: '/project/hugerte/js/hugerte',
    image_prepend_url: prependUrl
  }, [ Plugin ]);

  it('TBA: image recognizes relative src url and prepends relative image_prepend_url setting.', async () => {
    const editor = hook.editor();
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);

    fillActiveDialog({
      src: {
        value: 'src'
      },
      alt: 'alt'
    });
    const srcElem = UiFinder.findIn(SugarBody.body(), generalTabSelectors.src).getOrDie();
    fakeEvent(srcElem, 'change');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="' + prependUrl + 'src" alt="alt"></p>');
  });
});
