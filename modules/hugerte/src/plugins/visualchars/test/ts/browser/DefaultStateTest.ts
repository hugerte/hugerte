import { Keyboard, Keys, Waiter } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/visualchars/Plugin';

import { assertNbspStruct, assertSpanStruct } from '../module/test/Utils';

describe('browser.hugerte.plugins.visualchars.DefaultStateTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/hugerte/js/hugerte',
    visualchars_default_state: true
  }, [ Plugin ]);

  it('tests the default visualchars state', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;&nbsp;b</p>');

    // Need to trigger a keydown event to get the visual chars to show after calling set content
    Keyboard.activeKeydown(TinyDom.document(editor), Keys.space(), { });
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertSpanStruct(editor));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to disappear', () => assertNbspStruct(editor));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertSpanStruct(editor));
  });
});
