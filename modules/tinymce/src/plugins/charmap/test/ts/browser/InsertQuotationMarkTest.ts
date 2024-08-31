import { Mouse } from '@hugemce/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@hugemce/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/charmap/Plugin';

describe('browser.tinymce.plugins.charmap.InsertQuotationMarkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'charmap',
    charmap_append: [[ 34, 'quotation mark' ]],
    toolbar: 'charmap',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: Open dialog, click on the All tab and click on Quotation Mark and then assert Quotation Mark is inserted', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(dialog, '.tox-dialog__body-nav-item:contains(All)');
    Mouse.clickOn(dialog, '.tox-collection .tox-collection__item-icon:contains(")');
    TinyAssertions.assertContent(editor, '<p>"</p>');
  });
});
