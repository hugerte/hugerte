import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import * as Levels from 'hugerte/core/undo/Levels';

describe('browser.hugerte.core.undo.ForcedRootBlockTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/hugerte/js/hugerte'
  }, [], true);

  it('createFromEditor', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<strong>a</strong> <span>b</span>';

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '<strong>a</strong> <span>b</span>',
      fragments: null,
      type: 'complete'
    });
  });

  it('createFromEditor with iframes', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <strong>a</strong> <span>b</span>';

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [
        '<iframe src="about:blank"></iframe>',
        ' ',
        '<strong>a</strong>',
        ' ',
        '<span>b</span>'
      ],
      type: 'fragmented'
    });
  });
});
