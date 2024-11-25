import { UiFinder } from "@hugerte/agar";
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from "@hugerte/sugar";
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyState, TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import AdvListPlugin from 'hugerte/plugins/advlist/Plugin';
import ListPlugin from 'hugerte/plugins/lists/Plugin';

describe('browser.hugerte.plugins.advlist.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'lists advlist',
    toolbar: 'numlist bullist | outdent indent',
    contextmenu: 'lists',
    indent: false,
    base_url: '/project/hugerte/js/hugerte'
  }, [ ListPlugin, AdvListPlugin ], true);

  context('List ui controls', () => {
    const initialListContent = '<ol><li>a</li></ol>';
    const setupEditor = (editor: Editor) => {
      editor.setContent(initialListContent);
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    };

    it('TINY-9458: List buttons numlist/bullist should be disabled', () => {
      TinyState.withNoneditableRootEditor<Editor>(hook.editor(), (editor) => {
        setupEditor(editor);

        UiFinder.exists(TinyDom.container(editor), 'div[data-mce-name="numlist"][aria-disabled="true"]');
        UiFinder.exists(TinyDom.container(editor), 'div[data-mce-name="bullist"][aria-disabled="true"]');
      });
    });

    it('TINY-9458: Outdent/indent buttons should be noop', () => {
      TinyState.withNoneditableRootEditor<Editor>(hook.editor(), (editor) => {
        setupEditor(editor);

        TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="outdent"]');
        TinyAssertions.assertContent(editor, initialListContent);

        TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="indent"]');
        TinyAssertions.assertContent(editor, initialListContent);
      });
    });

    it('TINY-9458: Context menu list properties should be disabled', async () => {
      await TinyState.withNoneditableRootEditorAsync<Editor>(hook.editor(), async (editor) => {
        setupEditor(editor);

        await TinyUiActions.pTriggerContextMenu(editor, 'li', '.tox-silver-sink [role="menuitem"]:contains("List properties...")');
        UiFinder.exists(SugarBody.body(), '[role="menuitem"][aria-disabled="true"]:contains("List properties...")');
      });
    });
  });
});

