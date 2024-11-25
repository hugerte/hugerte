import { UiFinder } from "@hugerte/agar";
import { TestHelpers } from "@hugerte/alloy";
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from "@hugerte/katamari";
import { Attribute, SugarBody, SugarDocument, SugarElement } from "@hugerte/sugar";
import { TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import { Dialog } from 'hugerte/core/api/ui/Ui';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.hugerte.themes.silver.window.SilverDialogAriaLabelTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/hugerte/js/hugerte'
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
