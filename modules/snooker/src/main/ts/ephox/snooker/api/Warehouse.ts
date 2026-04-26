import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import * as DetailsList from '../model/DetailsList';
import * as LockedColumnUtils from '../util/LockedColumnUtils';
import { CompElm } from '../util/TableTypes';
import * as TableLookup from './TableLookup';

export interface Warehouse {
  readonly grid: Structs.Grid;
  readonly access: Record<string, Structs.DetailExt>;
  readonly all: Structs.RowDetail<Structs.DetailExt, HTMLTableRowElement>[];
  readonly columns: Record<number, Structs.ColumnExt>;
  readonly colgroups: Structs.Colgroup<Structs.ColumnExt>[];
}

const key = (row: number, column: number): string => {
  return row + ',' + column;
};

const getAt = (warehouse: Warehouse, row: number, column: number): (Structs.DetailExt) | null =>
  (warehouse.access[key(row, column)] ?? null);

const findItem = (warehouse: Warehouse, item: SugarElement<HTMLTableCellElement>, comparator: CompElm): (Structs.DetailExt) | null => {
  const filtered = filterItems(warehouse, (detail) => {
    return comparator(item, detail.element);
  });

  return filtered.length > 0 ? filtered[0] : null;
};

const filterItems = (warehouse: Warehouse, predicate: (x: Structs.DetailExt, i: number) => boolean): Structs.DetailExt[] => {
  const all = (warehouse.all).flatMap((r) => {
    return r.cells;
  });
  return (all).filter(predicate);
};

const generateColumns = (rowData: Structs.RowDetail<Structs.Detail<HTMLTableColElement>, HTMLTableColElement>): Record<number, Structs.ColumnExt> => {
  const columnsGroup: Record<number, Structs.ColumnExt> = {};
  let index = 0;

  (rowData.cells).forEach((column) => {
    const colspan = column.colspan;

    Array.from({length: colspan}, (_, _i) => ((columnIndex) => {
      const colIndex = index + columnIndex;
      columnsGroup[colIndex] = Structs.columnext(column.element, colspan, colIndex);
    })(_i));

    index += colspan;
  });

  return columnsGroup;
};

/*
 * From a list of list of Detail, generate three pieces of information:
 *  1. the grid size
 *  2. a data structure which can efficiently identify which cell is in which row,column position
 *  3. a list of all cells in order left-to-right, top-to-bottom
 */
const generate = (list: Structs.RowDetail<Structs.Detail>[]): Warehouse => {
  // list is an array of objects, made by cells and elements
  // elements: is the TR
  // cells: is an array of objects representing the cells in the row.
  //        It is made of:
  //          colspan (merge cell)
  //          element
  //          rowspan (merge cols)
  const access: Record<string, Structs.DetailExt> = {};
  const cells: Structs.RowDetail<Structs.DetailExt, HTMLTableRowElement>[] = [];

  const tableOpt = ((list)[0] ?? null).map((rowData) => rowData.element).bind(TableLookup.table);
  const lockedColumns: Record<string, true> = tableOpt.bind(LockedColumnUtils.getLockedColumnsFromTable) ?? ({});

  let maxRows = 0;
  let maxColumns = 0;
  let rowCount = 0;

  const { pass: colgroupRows, fail: rows } = (list).reduce((acc: { pass: any[], fail: any[] }, x: any, i: number) => { (((rowData) => rowData.section === 'colgroup')(x, i) ? acc.pass : acc.fail).push(x); return acc; }, { pass: [], fail: [] });

  // Handle rows first
  rows as Array<Structs.RowDetail<Structs.Detail<HTMLTableCellElement>.forEach(HTMLTableRowElement>>, (rowData) =) {
    const currentRow: Structs.DetailExt[] = [];
    (rowData.cells).forEach((rowCell) => {
      let start = 0;

      // If this spot has been taken by a previous rowspan, skip it.
      while (access[key(rowCount, start)] !== undefined) {
        start++;
      }

      const isLocked = (Object.prototype.hasOwnProperty.call(lockedColumns, start.toString()) && (lockedColumns)[start.toString()] != null);
      const current = Structs.extended(rowCell.element, rowCell.rowspan, rowCell.colspan, rowCount, start, isLocked);

      // Occupy all the (row, column) positions that this cell spans for.
      for (let occupiedColumnPosition = 0; occupiedColumnPosition < rowCell.colspan; occupiedColumnPosition++) {
        for (let occupiedRowPosition = 0; occupiedRowPosition < rowCell.rowspan; occupiedRowPosition++) {
          const rowPosition = rowCount + occupiedRowPosition;
          const columnPosition = start + occupiedColumnPosition;
          const newpos = key(rowPosition, columnPosition);
          access[newpos] = current;
          maxColumns = Math.max(maxColumns, columnPosition + 1);
        }
      }

      currentRow.push(current);
    });

    maxRows++;
    cells.push(Structs.rowdetail(rowData.element, currentRow, rowData.section));
    rowCount++;
  });

  // Handle colgroups
  // Note: Currently only a single colgroup is supported so just use the last one
  const { columns, colgroups } = Arr.last(colgroupRows as Array<Structs.RowDetail<Structs.Detail<HTMLTableColElement>, HTMLTableColElement>>).map((rowData) => {
    const columns = generateColumns(rowData);
    const colgroup = Structs.colgroup(rowData.element, Object.values(columns));
    return {
      colgroups: [ colgroup ],
      columns
    };
  }).getOrThunk(() => ({
    colgroups: [],
    columns: {}
  }));

  const grid = Structs.grid(maxRows, maxColumns);

  return {
    grid,
    access,
    all: cells,
    columns,
    colgroups
  };
};

const fromTable = (table: SugarElement<HTMLTableElement>): Warehouse => {
  const list = DetailsList.fromTable(table);
  return generate(list);
};

const justCells = (warehouse: Warehouse): Structs.DetailExt[] =>
  (warehouse.all).flatMap((w) => w.cells);

const justColumns = (warehouse: Warehouse): Structs.ColumnExt[] =>
  Object.values(warehouse.columns);

const hasColumns = (warehouse: Warehouse): boolean =>
  Object.keys(warehouse.columns).length > 0;

const getColumnAt = (warehouse: Warehouse, columnIndex: number): (Structs.ColumnExt) | null =>
  (warehouse.columns[columnIndex] ?? null);

export const Warehouse = {
  fromTable,
  generate,
  getAt,
  findItem,
  filterItems,
  justCells,
  justColumns,
  hasColumns,
  getColumnAt
};
