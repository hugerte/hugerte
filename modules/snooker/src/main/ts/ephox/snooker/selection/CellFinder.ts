import { Compare, SugarElement } from '@ephox/sugar';

import { Warehouse } from '../api/Warehouse';
import * as CellBounds from './CellBounds';
import * as CellGroup from './CellGroup';

const moveBy = (warehouse: Warehouse, cell: SugarElement<HTMLTableCellElement>, row: number, column: number): (SugarElement<HTMLTableCellElement>) | null => {
  return Warehouse.findItem(warehouse, cell, Compare.eq).bind((detail) => {
    const startRow = row > 0 ? detail.row + detail.rowspan - 1 : detail.row;
    const startCol = column > 0 ? detail.column + detail.colspan - 1 : detail.column;
    const dest = Warehouse.getAt(warehouse, startRow + row, startCol + column);
    return dest.map((d) => {
      return d.element;
    });
  });
};

const intercepts = (warehouse: Warehouse, start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>): (SugarElement<HTMLTableCellElement>[]) | null => {
  return CellGroup.getAnyBox(warehouse, start, finish).map((bounds) => {
    const inside = Warehouse.filterItems(warehouse, ((..._rest: any[]) => (CellBounds.inSelection)(bounds, ..._rest)));
    return (inside).map((detail) => {
      return detail.element;
    });
  });
};

const parentCell = (warehouse: Warehouse, innerCell: SugarElement<HTMLTableCellElement>): (SugarElement<HTMLTableCellElement>) | null => {
  const isContainedBy = (c1: SugarElement<HTMLElement>, c2: SugarElement<HTMLElement>) => {
    return Compare.contains(c2, c1);
  };
  return Warehouse.findItem(warehouse, innerCell, isContainedBy).map((detail) => {
    return detail.element;
  });
};

export {
  moveBy,
  intercepts,
  parentCell
};
