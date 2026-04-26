
import Editor from 'hugerte/core/api/Editor';

import * as Utils from '../core/Utils';
import * as CellDialog from '../ui/CellDialog';
import * as RowDialog from '../ui/RowDialog';
import * as TableDialog from '../ui/TableDialog';

const registerCommands = (editor: Editor): void => {
  const runAction = (f: () => void) => {
    if (Utils.isInEditableContext(Utils.getSelectionStart(editor))) {
      f();
    }
  };

  // Register dialog commands
  Object.entries({
    // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
    mceTableProps: ((..._rest: any[]) => (TableDialog.open)(editor, false, ..._rest)),
    mceTableRowProps: ((..._rest: any[]) => (RowDialog.open)(editor, ..._rest)),
    mceTableCellProps: ((..._rest: any[]) => (CellDialog.open)(editor, ..._rest)),
    mceInsertTableDialog: ((..._rest: any[]) => (TableDialog.open)(editor, true, ..._rest)),
  }).forEach(([_k, _v]: [any, any]) => ((func, name) => editor.addCommand(name, () => runAction(func)))(_v, _k));
};

export { registerCommands };
