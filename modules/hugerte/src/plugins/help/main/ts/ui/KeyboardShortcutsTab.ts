
import { Dialog } from 'hugerte/core/api/ui/Ui';

import * as ConvertShortcut from '../alien/ConvertShortcut';
import * as KeyboardShortcuts from '../data/KeyboardShortcuts';

export interface ShortcutActionPairType {
  shortcuts: string[];
  action: string;
}

const tab = (): Dialog.TabSpec & { name: string } => {
  const shortcutList = (KeyboardShortcuts.shortcuts).map((shortcut: ShortcutActionPairType) => {
    const shortcutText = (shortcut.shortcuts).map(ConvertShortcut.convertText).join(' or ');
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
