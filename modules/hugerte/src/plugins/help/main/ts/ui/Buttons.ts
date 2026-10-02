import Editor from 'hugerte/core/api/Editor';

const register = (editor: Editor, dialogOpener: () => void): void => {
  editor.ui.registry.addButton('help', {
    icon: 'help',
    tooltip: 'Help',
    shortcut: editor.shortcuts.getShortcut('mceHelp'),
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
