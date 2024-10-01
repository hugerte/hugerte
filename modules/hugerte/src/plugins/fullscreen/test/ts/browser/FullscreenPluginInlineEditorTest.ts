import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import FullscreenPlugin from 'hugerte/plugins/fullscreen/Plugin';
import LinkPlugin from 'hugerte/plugins/link/Plugin';

describe('browser.hugerte.plugins.fullscreen.FullScreenPluginInlineEditorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
    plugins: 'fullscreen link',
    toolbar: 'fullscreen link',
    base_url: '/project/hugerte/js/hugerte'
  }, [ FullscreenPlugin, LinkPlugin ]);

  it('TBA: Assert isFullscreen api function is present and fullscreen button is absent', () => {
    const editor = hook.editor();
    assert.isFalse(editor.plugins.fullscreen.isFullscreen(), 'should have isFullscreen api function');
    assert.isUndefined(editor.ui.registry.getAll().buttons.fullscreen, 'should not have the fullscreen button');
  });
});
