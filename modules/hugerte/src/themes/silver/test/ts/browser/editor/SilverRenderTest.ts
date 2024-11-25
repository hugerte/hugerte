import { UiFinder } from "@hugerte/agar";
import { after, describe, it } from '@ephox/bedrock-client';
import { Optional } from "@hugerte/katamari";
import { SugarElement, SugarShadowDom } from "@hugerte/sugar";
import { TinyDom, TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import PluginManager from 'hugerte/core/api/PluginManager';

interface RenderState {
  readonly container: Optional<SugarElement<Element>>;
  readonly sink: Optional<SugarElement<Element>>;
}

describe('browser.hugerte.themes.silver.editor.SilverRenderTest', () => {
  let initStates: Record<string, RenderState> = {};

  const TestPlugin = () => {
    PluginManager.add('test', (editor) => {
      initStates.plugin = getRenderState(editor);
    });
  };

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'test',
    base_url: '/project/hugerte/js/hugerte',
    setup: (editor: Editor) => {
      editor.on('PostRender init', (e) => {
        initStates[e.type] = getRenderState(editor);
      });
    }
  }, [ TestPlugin ]);

  after(() => {
    PluginManager.remove('test');
    initStates = {};
  });

  const getRenderState = (editor: Editor): RenderState => {
    const rootNode = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
    const container = SugarShadowDom.getContentContainer(rootNode);
    return {
      container: UiFinder.findIn(container, '.tox.tox-hugerte').toOptional(),
      sink: UiFinder.findIn(container, '.tox.tox-hugerte-aux').toOptional()
    };
  };

  it('TINY-8288: The editor container and sink should not be rendered until after plugins load', () => {
    const editor = hook.editor();

    // At plugin init
    assert.isFalse(initStates.plugin.container.isSome(), 'The editor container should not be rendered before the plugins initialize');
    assert.isFalse(initStates.plugin.sink.isSome(), 'The editor sink should not be rendered before the plugins initialize');

    // At PostRender
    assert.equal(initStates.postrender.container.getOrDie().dom, editor.getContainer(), 'The editor container should be rendered when PostRender fires');
    assert.isTrue(initStates.postrender.sink.isSome(), 'The editor sink should be rendered when PostRender fires');

    // At editor init
    assert.equal(initStates.init.container.getOrDie().dom, editor.getContainer(), 'The editor container should be rendered when init fires');
    assert.isTrue(initStates.init.sink.isSome(), 'The editor sink should be rendered when init fires');
  });
});
