import { Compare, SugarElement } from '@ephox/sugar';

import * as CellFinder from '../selection/CellFinder';
import * as CellGroup from '../selection/CellGroup';
import { Bounds } from './Structs';
import * as TableLookup from './TableLookup';
import { Warehouse } from './Warehouse';

const moveBy = (cell: SugarElement<HTMLTableCellElement>, deltaRow: number, deltaColumn: number): (SugarElement<HTMLTableCellElement>) | null => {
  return TableLookup.table(cell).bind((table) => {
    const warehouse = getWarehouse(table);
    return CellFinder.moveBy(warehouse, cell, deltaRow, deltaColumn);
  });
};

const intercepts = (
  table: SugarElement<HTMLTableElement>,
  first: SugarElement<HTMLTableCellElement>,
  last: SugarElement<HTMLTableCellElement>
): (SugarElement<HTMLTableCellElement>[]) | null => {
  const warehouse = getWarehouse(table);
  return CellFinder.intercepts(warehouse, first, last);
};

const nestedIntercepts = (
  table: SugarElement<HTMLTableElement>,
  first: SugarElement<HTMLTableCellElement>,
  firstTable: SugarElement<HTMLTableElement>,
  last: SugarElement<HTMLTableCellElement>,
  lastTable: SugarElement<HTMLTableElement>
): (SugarElement<HTMLTableCellElement>[]) | null => {
  const warehouse = getWarehouse(table);
  const optStartCell = Compare.eq(table, firstTable) ? first : CellFinder.parentCell(warehouse, first);
  const optLastCell = Compare.eq(table, lastTable) ? last : CellFinder.parentCell(warehouse, last);
  return optStartCell.bind(
    (startCell) => optLastCell.bind(
      (lastCell) => CellFinder.intercepts(warehouse, startCell, lastCell)
    )
  );
};

const getBox = (table: SugarElement<HTMLTableElement>, first: SugarElement<HTMLTableCellElement>, last: SugarElement<HTMLTableCellElement>): (Bounds) | null => {
  const warehouse = getWarehouse(table);
  return CellGroup.getBox(warehouse, first, last);
};

// Private method ... keep warehouse in snooker, please.
const getWarehouse = Warehouse.fromTable;

export {
  moveBy,
  intercepts,
  nestedIntercepts,
  getBox
};
