import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.hugerte.plugins.link.SelectedLinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link openlink unlink',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  it('TBA: should not get anchor info if not selected node', async () => {
    TestLinkUi.clearHistory();
    const editor = hook.editor();
    editor.setContent('<p><a href="http://hugerte.com">tiny</a></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    editor.execCommand('mcelink');
    await TinyUiActions.pWaitForDialog(editor);
    TestLinkUi.assertDialogContents({
      href: '',
      text: '',
      title: '',
      target: ''
    });
    await TestLinkUi.pClickCancel(editor);
    TestLinkUi.clearHistory();
  });

  it('TINY-4867: link should not be active when multiple links or plain text selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://hugerte.com">a</a> b <a href="http://hugerte.com">c</a></p>');
    // Check the link button is enabled (single link)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="link"].tox-tbtn--enabled');
    // Check the link button is enabled (collapsed in link)
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="link"].tox-tbtn--enabled');
    // Check the link button is disabled (text)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="link"]:not(.tox-tbtn--enabled)');
    // Check the link button is disabled (multiple links)
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 2);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="link"]:not(.tox-tbtn--enabled)');
  });

  it('TINY-4867: openlink should be disabled when multiple links or plain text selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://hugerte.com">a</a> b <a href="http://hugerte.com">c</a></p>');
    // Check the open link button is enabled (single link)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="openlink"]:not(.tox-tbtn--disabled)');
    // Check the open link button is enabled (collapsed in link)
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="openlink"]:not(.tox-tbtn--disabled)');
    // Check the open link button is disabled (text)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="openlink"].tox-tbtn--disabled');
    // Check the open link button is disabled (multiple links)
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 2);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="openlink"].tox-tbtn--disabled');
  });

  it('TINY-4867: unlink should be enabled when single link or multiple links selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://hugerte.com">a</a> b <a href="http://hugerte.com">c</a></p>');
    // Check the unlink button is enabled (single link)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="unlink"]:not(.tox-tbtn--disabled)');
    // Check the unlink button is enabled (collapsed in link)
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="unlink"]:not(.tox-tbtn--disabled)');
    // Check the unlink button is disabled (text)
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 2);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="unlink"].tox-tbtn--disabled');
    // Check the unlink button is enabled (multiple links)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await TinyUiActions.pWaitForUi(editor, 'button[data-mce-name="unlink"]:not(.tox-tbtn--disabled)');
  });
});
