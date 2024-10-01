import { RealMouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/image/Plugin';

describe('webdriver.hugerte.plugins.lists.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/hugerte/js/hugerte',
    contextmenu: 'lists'
  }, [ Plugin ], true);

  it('TINY-10490: open contextmenu directly on a li of a ol should have `List properties...` enabled', async () => {
    const editor = hook.editor();
    editor.setContent(`
      <ul>
        <li>ul</li>
      </ul>
      <ol>
        <li>ol</li>
      </ol>`
    );
    await RealMouse.pRightClickOn('iframe => ol > li');
    UiFinder.exists(SugarBody.body(), '[aria-label="List properties..."][aria-disabled="false"]');
  });
});
