import Editor from 'hugerte/core/api/Editor';
import { Toolbar } from 'hugerte/core/api/ui/Ui';

// This button is replaced by the theme (silver registers its own `help` button), so this
// handler only matters for custom themes. Keep its tooltip in sync with the shortcut.
const onSetupHelpShortcut = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi): (() => void) => {
  const updateTooltip = () => {
    const shortcut = editor.shortcuts.getShortcut('mceHelp');
    api.setTooltip(editor.translate('Help') + (shortcut ? ` (${shortcut})` : ''));
  };
  editor.on('ShortcutsChanged', updateTooltip);
  return () => editor.off('ShortcutsChanged', updateTooltip);
};

const register = (editor: Editor, dialogOpener: () => void): void => {
  editor.ui.registry.addButton('help', {
    icon: 'help',
    tooltip: 'Help',
    shortcut: editor.shortcuts.getShortcut('mceHelp'),
    onSetup: onSetupHelpShortcut(editor),
    onAction: dialogOpener
  });

  const registerMenuItem = () => editor.ui.registry.addMenuItem('help', {
    text: 'Help',
    icon: 'help',
    shortcut: editor.shortcuts.getShortcut('mceHelp'),
    onAction: dialogOpener
  });
  registerMenuItem();
  editor.on('ShortcutsChanged', registerMenuItem);
};

export {
  register
};
