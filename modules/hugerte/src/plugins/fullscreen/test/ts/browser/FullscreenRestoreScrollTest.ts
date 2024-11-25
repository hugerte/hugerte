import { Waiter } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { Css, Insert, InsertAll, Remove, Scroll, SugarBody, SugarElement } from "@hugerte/sugar";
import { TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/fullscreen/Plugin';

describe('browser.hugerte.plugins.fullscreen.FullscreenRestoreScrollTest', () => {
  const setupElement = () => {
    const container = SugarElement.fromTag('div');
    const beforeSpacer = SugarElement.fromTag('div');
    const afterSpacer = SugarElement.fromTag('div');
    const editorElm = SugarElement.fromTag('textarea');

    Css.set(beforeSpacer, 'height', '2000px');
    Css.set(afterSpacer, 'height', '2000px');

    InsertAll.append(container, [ beforeSpacer, editorElm, afterSpacer ]);
    Insert.append(SugarBody.body(), container);

    return {
      element: editorElm,
      teardown: () => Remove.remove(container)
    };
  };

  const hook = TinyHooks.bddSetupFromElement<Editor>({
    plugins: 'fullscreen',
    base_url: '/project/hugerte/js/hugerte'
  }, setupElement, [ Plugin ]);

  const pWaitForEditorToBeScrolledIntoView = (label: string) => Waiter.pTryUntil(label, () => {
    const editor = hook.editor();
    assert.approximately(Scroll.get().top, editor.getContainer().offsetTop, 5);
  });

  it('TINY-8418: restores the scroll position when exiting fullscreen mode', async () => {
    const editor = hook.editor();

    // Note: Don't use Sugar Scroll module here as it ignores the alignToTop argument on Safari
    editor.getContainer().scrollIntoView(true);
    await pWaitForEditorToBeScrolledIntoView('Wait for the window to scroll');

    // Toggle fullscreen and then disable
    editor.execCommand('mceFullScreen');
    editor.execCommand('mceFullScreen');

    await pWaitForEditorToBeScrolledIntoView('Wait for the scroll position to be restored');
  });
});
