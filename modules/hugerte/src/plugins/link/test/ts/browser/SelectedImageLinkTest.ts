import { FocusTools, UiFinder } from "@hugerte/agar";
import { describe, it, before, after } from '@ephox/bedrock-client';
import { SugarBody, SugarDocument } from "@hugerte/sugar";
import { TinyHooks, TinySelections } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.hugerte.plugins.link.SelectedImageTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  const doc = SugarDocument.getDocument();

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  it('TBA: images should be preserved when adding a link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="image.png"></p>');
    TinySelections.select(editor, 'img', []);
    await TestLinkUi.pOpenLinkDialog(editor);
    FocusTools.setActiveValue(doc, 'http://something');
    UiFinder.notExists(SugarBody.body(), '.tox-label:contains("Text to display")');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'img[src="image.png"]': 1,
      'p': 1
    });
  });

  it('TBA: images should be preserved when editing a link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://www.google.com/"><img src="image.png"></a></p>');
    TinySelections.select(editor, 'a', []);
    await TestLinkUi.pOpenLinkDialog(editor);
    FocusTools.setActiveValue(doc, 'http://something');
    UiFinder.notExists(SugarBody.body(), '.tox-label:contains("Text to display")');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'img[src="image.png"]': 1,
      'p': 1
    });
  });

  it('TINY-4706: images link urls should be able to be removed', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://www.google.com/" title="test"><img src="image.png"></a></p>');
    TinySelections.select(editor, 'a', []);
    await TestLinkUi.pOpenLinkDialog(editor);
    const focused = FocusTools.setActiveValue(doc, '');
    TestLinkUi.fireEvent(focused, 'input');
    UiFinder.notExists(SugarBody.body(), '.tox-label:contains("Text to display")');
    TestLinkUi.assertDialogContents({
      url: '',
      title: 'test'
    });
    await TestLinkUi.pClickCancel(editor);
  });
});
