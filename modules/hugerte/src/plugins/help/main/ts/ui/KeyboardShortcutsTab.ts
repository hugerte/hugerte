import { Arr } from '@ephox/katamari';

import Editor from 'hugerte/core/api/Editor';
import { Dialog } from 'hugerte/core/api/ui/Ui';

import * as ConvertShortcut from '../alien/ConvertShortcut';
import * as KeyboardShortcuts from '../data/KeyboardShortcuts';

export interface ShortcutActionPairType {
  shortcuts: string[];
  action: string;
}

const tab = (editor: Editor): Dialog.TabSpec & { name: string } => {
  const helpShortcuts = editor.shortcuts.getShortcuts('mceHelp');
  const shortcuts = Arr.bind(KeyboardShortcuts.shortcuts, (shortcut) => {
    if (shortcut.action === 'Open help dialog') {
      return helpShortcuts.length > 0 ? [{ shortcuts: helpShortcuts, action: shortcut.action }] : [];
    }
    return [ shortcut ];
  });
  const shortcutList = Arr.map(shortcuts, (shortcut: ShortcutActionPairType) => {
    const shortcutText = Arr.map(shortcut.shortcuts, ConvertShortcut.convertText).join(' or ');
    return [ shortcut.action, shortcutText ];
  });

  const tablePanel: Dialog.TableSpec = {
    type: 'table',
    // TODO: Fix table styles #TINY-2909
    header: [ 'Action', 'Shortcut' ],
    cells: shortcutList
  };
  return {
    name: 'shortcuts',
    title: 'Handy Shortcuts',
    items: [
      tablePanel
    ]
  };
};

export {
  tab
};
