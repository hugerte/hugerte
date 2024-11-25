import { UiFinder } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/codesample/Plugin';

import * as TestUtils from '../module/CodeSampleTestUtils';

describe('browser.hugerte.plugins.codesample.CodeSampleSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'codesample',
    toolbar: 'codesample',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  const dialogSelector = 'div.tox-dialog';
  const markupContent = '<p>hello world</p>';

  it('TBA: Open the dialog and check it has the right initial values. ' +
    'Set the codesample content, submit and check the editor content changes correctly. ' +
    'Double-click on the editor and check if the dialog opens with the correct language and content.', async () => {
    const editor = hook.editor();
    await TestUtils.pOpenDialogAndAssertInitial(editor, 'markup', '');
    TestUtils.setTextareaContent(markupContent);
    await TestUtils.pSubmitDialog(editor);
    await TestUtils.pAssertEditorContents(TinyDom.body(editor), 'markup', markupContent, 'pre.language-markup');
    const pre = editor.getBody().querySelector('pre');
    editor.dispatch('dblclick', { target: pre } as unknown as MouseEvent);
    await UiFinder.pWaitForVisible('Waited for dialog to be visible', SugarBody.body(), dialogSelector);
    TestUtils.assertCodeSampleDialog('markup', markupContent);
    await TestUtils.pCancelDialog(editor);
  });

  it('TBA: Selecting code sample should update button state', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p><pre class="language-markup"><code></code></pre>');
    TinySelections.select(editor, 'p', []);
    editor.nodeChanged();
    UiFinder.notExists(TinyDom.body(editor), 'button[aria-pressed="true"]');
    TinySelections.select(editor, 'pre.language-markup', []);
    editor.nodeChanged();
    await TinyUiActions.pWaitForUi(editor, 'button[aria-pressed="true"]');
  });
});
