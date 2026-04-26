import { TableRender, TableConversions } from '@ephox/snooker';
import { Attribute, Html, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';

import * as Events from '../api/Events';
import * as Options from '../api/Options';
import * as Utils from '../core/TableUtils';

const placeCaretInCell = (editor: Editor, cell: SugarElement<HTMLTableCellElement>): void => {
  editor.selection.select(cell.dom, true);
  editor.selection.collapse(true);
};

const selectFirstCellInTable = (editor: Editor, tableElm: SugarElement<HTMLTableElement>): void => {
  SelectorFind.descendant<HTMLTableCellElement>(tableElm, 'td,th').each(((..._rest: any[]) => (placeCaretInCell)(editor, ..._rest)));
};

const fireEvents = (editor: Editor, table: SugarElement<HTMLTableElement>): void => {
  (SelectorFilter.descendants<HTMLTableRowElement>(table, 'tr')).forEach((row) => {
    Events.fireNewRow(editor, row.dom);

    (SelectorFilter.descendants<HTMLTableCellElement>(row, 'th,td')).forEach((cell) => {
      Events.fireNewCell(editor, cell.dom);
    });
  });
};

const isPercentage = (width: string): boolean =>
  typeof (width) === 'string' && width.indexOf('%') !== -1;

const insert = (editor: Editor, columns: number, rows: number, colHeaders: number, rowHeaders: number): HTMLTableElement | null => {
  const defaultStyles = Options.getTableDefaultStyles(editor);
  const options: TableRender.RenderOptions = {
    styles: defaultStyles,
    attributes: Options.getTableDefaultAttributes(editor),
    colGroups: Options.tableUseColumnGroup(editor)
  };

  // Don't create an undo level when inserting the base table HTML otherwise we can end up with 2 undo levels
  editor.undoManager.ignore(() => {
    const table = TableRender.render(rows, columns, rowHeaders, colHeaders, Options.getTableHeaderType(editor), options);
    Attribute.set(table, 'data-mce-id', '__mce');

    const html = Html.getOuter(table);
    editor.insertContent(html);
    editor.addVisual();
  });

  // Enforce the sizing mode of the table
  return SelectorFind.descendant<HTMLTableElement>(Utils.getBody(editor), 'table[data-mce-id="__mce"]').map((table) => {
    if (Options.isTablePixelsForced(editor)) {
      TableConversions.convertToPixelSizeWidth(table);
    } else if (Options.isTableResponsiveForced(editor)) {
      TableConversions.convertToNoneSizeWidth(table);
    } else if (Options.isTablePercentagesForced(editor) || isPercentage(defaultStyles.width)) {
      TableConversions.convertToPercentSizeWidth(table);
    }
    Utils.removeDataStyle(table);
    Attribute.remove(table, 'data-mce-id');
    fireEvents(editor, table);
    selectFirstCellInTable(editor, table);
    return table.dom;
  }) ?? null;
};

const insertTable = (editor: Editor, rows: number, columns: number, options: Record<string, number> = {}): HTMLTableElement | null => {
  const checkInput = (val: any) => typeof (val) === 'number' && val > 0;

  if (checkInput(rows) && checkInput(columns)) {
    const headerRows = options.headerRows || 0;
    const headerColumns = options.headerColumns || 0;
    return insert(editor, columns, rows, headerColumns, headerRows);
  } else {
    // eslint-disable-next-line no-console
    console.error('Invalid values for mceInsertTable - rows and columns values are required to insert a table.');
    return null;
  }
};

export {
  insertTable
};
