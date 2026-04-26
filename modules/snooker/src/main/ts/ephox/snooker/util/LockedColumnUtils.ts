
import { Attribute, SugarElement } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import * as GridRow from '../model/GridRow';

export const LOCKED_COL_ATTR = 'data-snooker-locked-cols';

const getLockedColumnsFromTable = (table: SugarElement<HTMLTableElement>): (Record<string, true>) | null =>
  Attribute.getOpt(table, LOCKED_COL_ATTR)
    .bind((lockedColStr) => (lockedColStr.match(/\d+/g) ?? null))
    .map((lockedCols) => Object.fromEntries((lockedCols).map((_k: any) => [_k, ((() => true as const))(_k)])));

// Need to check all of the cells to determine which columns are locked - reasoning is because rowspan and colspan cells where the same cell is used by multiple columns
const getLockedColumnsFromGrid = (grid: Structs.RowCells[]): number[] => {
  const locked = GridRow.extractGridDetails(grid).rows.reduce((acc, row) => {
    (row.cells).forEach((cell, idx) => {
      if (cell.isLocked) {
        acc[idx] = true;
      }
    });
    return acc;
  }, {} as Record<number, boolean>);

  const lockedArr = Object.entries(locked).map(([_k, _v]: [any, any]) => ((_val, key) => parseInt(key, 10))(_v, _k as any));
  return [...(lockedArr)].sort();
};

export {
  getLockedColumnsFromTable,
  getLockedColumnsFromGrid
};
