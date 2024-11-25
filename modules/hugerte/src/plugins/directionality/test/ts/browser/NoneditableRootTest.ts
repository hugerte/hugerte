import { UiFinder } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyHooks, TinySelections, TinyState } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/directionality/Plugin';

describe('browser.hugerte.plugins.directionality.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'directionality',
    toolbar: 'ltr rtl',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ], true);

  it('TINY-9669: Disable ltr button on noneditable content', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Left to right"][aria-disabled="true"]');
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Left to right"][aria-disabled="false"]');
    });
  });

  it('TINY-9669: Disable rtl button on noneditable content', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Right to left"][aria-disabled="true"]');
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Right to left"][aria-disabled="false"]');
    });
  });
});

