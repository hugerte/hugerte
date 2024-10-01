import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/code/Plugin';

describe('browser.hugerte.plugins.code.CodeTextareaTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'code',
    toolbar: 'code',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  const pOpenDialog = async (editor: Editor) => {
    editor.execCommand('mceCodeEditor');
    await TinyUiActions.pWaitForDialog(editor);
  };

  const getWhiteSpace = (editor: Editor) => {
    const element = editor.getElement();
    return editor.dom.getStyle(element, 'white-space', true);
  };

  const pAssertWhiteSpace = async (editor: Editor) => {
    await pOpenDialog(editor);
    const whitespace = getWhiteSpace(editor);
    assert.equal(whitespace, 'pre-wrap', 'Textarea should have "white-space: pre-wrap"');
  };

  it('TBA: Verify if "white-space: pre-wrap" style is set on the textarea', async () => {
    const editor = hook.editor();
    await pAssertWhiteSpace(editor);
    TinyUiActions.cancelDialog(editor);
  });
});
