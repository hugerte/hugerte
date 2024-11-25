import { describe, it } from '@ephox/bedrock-client';
import { Css, SelectorFind } from "@hugerte/sugar";
import { TinyHooks, TinyDom } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import FullscreenPlugin from 'hugerte/plugins/fullscreen/Plugin';

describe('browser.hugerte.plugins.fullscreen.FullScreenSinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'fullscreen',
    toolbar: 'fullscreen',
    base_url: '/project/hugerte/js/hugerte',
    ui_mode: 'split'
  }, [ FullscreenPlugin ]);

  it('TINY-10335: Sink should have fixed css position when fullscreen is on (ui_mode="split")', () => {
    const editor = hook.editor();
    const container = TinyDom.container(editor);
    const sink = SelectorFind.sibling(container, '.tox-silver-sink').getOrDie('Could not find sink');
    assert.equal(Css.get(sink, 'position'), 'relative');
    editor.execCommand('mceFullScreen');
    assert.equal(Css.get(sink, 'position'), 'fixed');
    editor.execCommand('mceFullScreen');
    assert.equal(Css.get(sink, 'position'), 'relative');
  });
});
