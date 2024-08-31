import { UiFinder } from '@hugemce/agar';
import { TestHelpers } from '@hugemce/alloy';
import { context, describe, it } from '@hugemce/bedrock-client';
import { Arr } from '@hugemce/katamari';
import { Attribute, SugarBody, SugarDocument, SugarElement } from '@hugemce/sugar';
import { TinyHooks } from '@hugemce/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverDialogAriaLabelTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '.tox-dialog { background: white; border: 2px solid black; padding: 1em; margin: 1em; }'
  ]);

  const dialogSpec: Dialog.DialogSpec<{}> = {
    title: 'Silver Test Inline (Toolbar) Dialog',
    body: {
      type: 'panel',
      items: []
    },
    buttons: [],
    initialData: {}
  };

  const getDialogLabelId = (dialog: SugarElement<HTMLElement>) => {
    if (Attribute.has(dialog, 'aria-labelledby')) {
      return Attribute.getOpt(dialog, 'aria-labelledby')
        .filter((labelId) => labelId.length > 0)
        .getOrDie('Dialog has zero length aria-labelledby attribute');
    } else {
      throw new Error('Dialog has no aria-labelledby attribute');
    }
  };

  const assertDialogLabelledBy = () => {
    const dialog = UiFinder.findIn<HTMLElement>(SugarBody.body(), '[role="dialog"]').getOrDie();
    const labelId = getDialogLabelId(dialog);
    UiFinder.exists(dialog, `#${labelId}`);
  };

  Arr.each([
    { label: 'Modal', params: { }},
    { label: 'Inline', params: { inline: 'toolbar' as 'toolbar' }}
  ], (test) => {
    context(test.label, () => {
      it(`Dialog should have "aria-labelledby" for config "${JSON.stringify(test.params)}"`, () => {
        const editor = hook.editor();
        DialogUtils.open(editor, dialogSpec, test.params);
        assertDialogLabelledBy();
        DialogUtils.close(editor);
      });
    });
  });
});
