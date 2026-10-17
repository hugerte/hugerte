import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.themes.silver.editor.core.HelpShortcutTooltipTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    toolbar: 'help'
  }, []);

  it('#192: does not advertise an unregistered shortcut and follows runtime command changes', () => {
    const editor = hook.editor();
    UiFinder.exists(SugarBody.body(), 'button[data-mce-name="help"][aria-label="Help"]');
    editor.shortcuts.add('F1', 'Open help dialog', 'mceHelp');
    UiFinder.exists(SugarBody.body(), 'button[data-mce-name="help"][aria-label="Help (F1)"]');
    editor.shortcuts.remove('f1');
    UiFinder.exists(SugarBody.body(), 'button[data-mce-name="help"][aria-label="Help"]');
  });
});
