import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarBody, TextContent } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import { Toolbar } from 'hugerte/core/api/ui/Ui';
import Plugin from 'hugerte/plugins/help/Plugin';
import * as ConvertShortcut from 'hugerte/themes/silver/ui/alien/ConvertShortcut';

// Dispatch through the real shortcut listener without depending on the host keyboard layout.
const altZero = (editor: Editor): boolean => {
  const event = new KeyboardEvent('keydown', { key: '@', keyCode: 48, altKey: true, cancelable: true });
  editor.getBody().dispatchEvent(event);
  return event.defaultPrevented;
};

describe('browser.hugerte.plugins.help.HelpShortcutTest', () => {
  describe('default and runtime changes', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'help', toolbar: 'help',
      base_url: '/project/hugerte/js/hugerte'
    }, [ Plugin ]);

    const assertTooltip = async (editor: Editor, expected: string) => {
      Mouse.hoverOn(SugarBody.body(), 'button[data-mce-name="help"]');
      const tooltip = await TinyUiActions.pWaitForUi(editor, '.tox-tooltip__body');
      assert.equal(TextContent.get(tooltip), expected);
      Mouse.mouseOut(UiFinder.findIn(SugarBody.body(), 'button[data-mce-name="help"]').getOrDie());
      await Waiter.pTryUntil('Tooltip hidden', () => UiFinder.notExists(SugarBody.body(), '.tox-tooltip__body'));
    };

    it('#192: preserves Alt+0 by default and updates tooltip after removal and remapping', async () => {
      const editor = hook.editor();
      assert.equal(editor.shortcuts.getShortcut('mceHelp'), 'Alt+0');
      assert.isTrue(altZero(editor));
      await TinyUiActions.pWaitForDialog(editor);
      TinyUiActions.closeDialog(editor);
      await assertTooltip(editor, `Help (${ConvertShortcut.convertText('Alt+0')})`);
      editor.shortcuts.remove('alt+0');
      assert.isFalse(altZero(editor));
      assert.isUndefined(editor.ui.registry.getAll().menuItems.help.shortcut);
      await assertTooltip(editor, 'Help');
      editor.shortcuts.add('F1', 'Open help dialog', 'mceHelp');
      await assertTooltip(editor, 'Help (F1)');
      editor.shortcuts.add('F1', 'Different command', Fun.noop);
      await assertTooltip(editor, 'Help');
    });
  });

  describe('disabled', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'help', toolbar: 'help', statusbar: true, help_shortcut: false,
      base_url: '/project/hugerte/js/hugerte'
    }, [ Plugin ]);

    it('#192: does not consume the AZERTY @ keydown and keeps the help button usable', async () => {
      const editor = hook.editor();
      assert.isFalse(altZero(editor));
      assert.isUndefined((editor.ui.registry.getAll().buttons.help as Toolbar.ToolbarButtonSpec).shortcut);
      assert.isUndefined(editor.ui.registry.getAll().menuItems.help.shortcut);
      UiFinder.notExists(SugarBody.body(), '.tox-statusbar__help-text');
      TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="help"]');
      await TinyUiActions.pWaitForDialog(editor);
      UiFinder.notExists(SugarBody.body(), '.tox-dialog tr:contains("Open help dialog")');
      TinyUiActions.closeDialog(editor);
    });
  });

  describe('custom', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'help', toolbar: 'help', statusbar: true, help_shortcut: 'Access+0',
      base_url: '/project/hugerte/js/hugerte'
    }, [ Plugin ]);

    it('#192: custom shortcut replaces Alt+0 in the keyboard handler and UI', async () => {
      const editor = hook.editor();
      assert.isFalse(altZero(editor));
      assert.equal((editor.ui.registry.getAll().buttons.help as Toolbar.ToolbarButtonSpec).shortcut, 'Access+0');
      assert.equal(editor.ui.registry.getAll().menuItems.help.shortcut, 'Access+0');
      const helpText = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__help-text').getOrDie();
      assert.equal(TextContent.get(helpText), `Press ${ConvertShortcut.convertText('Access+0')} for help`);
      const os = PlatformDetection.detect().os;
      const isMac = os.isMacOS() || os.isiOS();
      const event = new KeyboardEvent('keydown', {
        keyCode: 48, altKey: true, ctrlKey: isMac, shiftKey: !isMac, cancelable: true
      });
      editor.getBody().dispatchEvent(event);
      assert.isTrue(event.defaultPrevented);
      await TinyUiActions.pWaitForDialog(editor);
      const row = UiFinder.findIn(SugarBody.body(), '.tox-dialog tr:contains("Open help dialog")').getOrDie();
      assert.include((TextContent.get(row) ?? '').replace(/\s/g, ''), ConvertShortcut.convertText('Access+0'));
      TinyUiActions.closeDialog(editor);
    });
  });
});
