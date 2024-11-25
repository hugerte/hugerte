import { Keys } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyContentActions } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.hugerte.plugins.link.PreventDefaultTest', () => {

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link openlink unlink',
    base_url: '/project/hugerte/js/hugerte',
    setup: (ed: Editor) => {
      const hasOnlyAltModifier = (e: KeyboardEvent) => {
        return (
          e.altKey === true &&
          e.shiftKey === false &&
          e.ctrlKey === false &&
          e.metaKey === false
        );
      };

      ed.on('keydown', (event) => {
        if (event.keyCode === 13 && hasOnlyAltModifier(event)) {
          event.preventDefault();
        }
      }, true);
    },
  }, [ Plugin ]);

  it('TINY-8661: links should not open when using alt+enter (option+enter on Mac) when preventDefault() is called', () => {
    TestLinkUi.clearHistory();
    const editor = hook.editor();
    editor.setContent(`<h1><a href="#foo">foo anchor</a></h1><p style="height: 5000px;">long p</p><p id="foo">foo</p>`);
    const pos = editor.getWin().scrollY;
    assert.equal(pos, 0);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 3);
    TinyContentActions.keydown(editor, Keys.enter(), {
      altKey: true,
    });
    assert.equal(editor.getWin().scrollY, pos);
  });
});
