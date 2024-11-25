import { Keys } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.keyboard.TableTabNavigationDisabledTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    table_tab_navigation: false,
    base_url: '/project/hugerte/js/hugerte'
  }, [], true);

  const tableHtml = '<table><tbody><tr><td>a</td></tr><tr><td>a</td></tr></tbody></table>';

  it('TBA: test table tab navigation does nothing', () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });
});
