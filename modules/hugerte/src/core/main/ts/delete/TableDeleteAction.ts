import { Adt } from '@ephox/katamari';
import { Compare, SelectorFind, SugarElement } from '@ephox/sugar';

import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';
import * as TableDeleteUtils from './TableDeleteUtils';

type IsRootFn = TableDeleteUtils.IsRootFn;
type SelectionDetails = TableDeleteUtils.TableSelectionDetails;

export interface OutsideTableDetails extends SelectionDetails {
  readonly rng: Range;
}

type SingleCellTableFn<T> = (rng: Range, cell: SugarElement<HTMLTableCellElement>) => T;
type FullTableFn<T> = (table: SugarElement<HTMLTableElement>) => T;
type PartialTableFn<T> = (cells: SugarElement<HTMLTableCellElement>[], outsideDetails: (OutsideTableDetails) | null) => T;
type MultiTableFn<T> = (startTableCells: SugarElement<HTMLTableCellElement>[], endTableCells: SugarElement<HTMLTableCellElement>[], betweenRng: Range) => T;

export interface DeleteActionAdt {
  fold: <T> (
    singleCellTable: SingleCellTableFn<T>,
    fullTable: FullTableFn<T>,
    partialTable: PartialTableFn<T>,
    multiTable: MultiTableFn<T>,
  ) => T;
  match: <T> (branches: {
    singleCellTable: SingleCellTableFn<T>;
    fullTable: FullTableFn<T>;
    partialTable: PartialTableFn<T>;
    multiTable: MultiTableFn<T>;
  }) => T;
  log: (label: string) => void;
}

interface TableCellRng {
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly end: SugarElement<HTMLTableCellElement>;
}

interface TableSelection {
  readonly rng: TableCellRng;
  readonly table: SugarElement<HTMLTableElement>;
  readonly cells: SugarElement<HTMLTableCellElement>[];
}

interface TableSelections {
  readonly start: (TableSelection) | null;
  readonly end: (TableSelection) | null;
}

const tableCellRng = (start: SugarElement<HTMLTableCellElement>, end: SugarElement<HTMLTableCellElement>): TableCellRng => ({
  start,
  end,
});

const tableSelection = (rng: TableCellRng, table: SugarElement<HTMLTableElement>, cells: SugarElement<HTMLTableCellElement>[]): TableSelection => ({
  rng,
  table,
  cells
});

const deleteAction: {
  singleCellTable: SingleCellTableFn<DeleteActionAdt>;
  fullTable: FullTableFn<DeleteActionAdt>;
  partialTable: PartialTableFn<DeleteActionAdt>;
  multiTable: MultiTableFn<DeleteActionAdt>;
} = Adt.generate([
  { singleCellTable: [ 'rng', 'cell' ] },
  { fullTable: [ 'table' ] },
  { partialTable: [ 'cells', 'outsideDetails' ] },
  { multiTable: [ 'startTableCells', 'endTableCells', 'betweenRng' ] },
]);

const getClosestCell = (container: Node, isRoot: (e: SugarElement<Node>) => boolean): (SugarElement<HTMLTableCellElement>) | null =>
  SelectorFind.closest<HTMLTableCellElement>(SugarElement.fromDom(container), 'td,th', isRoot);

const isExpandedCellRng = (cellRng: TableCellRng): boolean =>
  !Compare.eq(cellRng.start, cellRng.end);

const getTableFromCellRng = (cellRng: TableCellRng, isRoot: IsRootFn): (SugarElement<HTMLTableElement>) | null =>
  TableCellSelection.getClosestTable(cellRng.start, isRoot)
    .bind((startParentTable) =>
      TableCellSelection.getClosestTable(cellRng.end, isRoot)
        .bind((endParentTable) => (Compare.eq(startParentTable, endParentTable) ? startParentTable : null)));

const isSingleCellTable = (cellRng: TableCellRng, isRoot: IsRootFn): boolean => !isExpandedCellRng(cellRng) &&
   getTableFromCellRng(cellRng, isRoot).exists((table) => {
     const rows = table.dom.rows;
     return rows.length === 1 && rows[0].cells.length === 1;
   });

const getCellRng = (rng: Range, isRoot: IsRootFn): (TableCellRng) | null => {
  const startCell = getClosestCell(rng.startContainer, isRoot);
  const endCell = getClosestCell(rng.endContainer, isRoot);
  return (startCell !== null && endCell !== null ? (tableCellRng)(startCell, endCell) : null);
};

const getCellRangeFromStartTable = (isRoot: IsRootFn) => (startCell: SugarElement<HTMLTableCellElement>): (TableCellRng) | null =>
  TableCellSelection.getClosestTable(startCell, isRoot).bind((table) =>
    ((TableDeleteUtils.getTableCells(table)).at(-1) ?? null).map((endCell) => tableCellRng(startCell, endCell))
  );

const getCellRangeFromEndTable = (isRoot: IsRootFn) => (endCell: SugarElement<HTMLTableCellElement>): (TableCellRng) | null =>
  TableCellSelection.getClosestTable(endCell, isRoot).bind((table) =>
    ((TableDeleteUtils.getTableCells(table))[0] ?? null).map((startCell) => tableCellRng(startCell, endCell))
  );

const getTableSelectionFromCellRng = (isRoot: IsRootFn) => (cellRng: TableCellRng): (TableSelection) | null =>
  getTableFromCellRng(cellRng, isRoot).map((table) => tableSelection(cellRng, table, TableDeleteUtils.getTableCells(table)));

const getTableSelections = (cellRng: (TableCellRng) | null, selectionDetails: SelectionDetails, rng: Range, isRoot: IsRootFn): (TableSelections) | null => {
  if (rng.collapsed || !cellRng.forall(isExpandedCellRng)) {
    return null;
  } else if (selectionDetails.isSameTable) {
    const sameTableSelection = cellRng.bind(getTableSelectionFromCellRng(isRoot));
    return {
      start: sameTableSelection,
      end: sameTableSelection
    };
  } else {
    // Covers partial table selection (either start or end will have a tableSelection) and multitable selection (both start and end will have a tableSelection)
    const startCell = getClosestCell(rng.startContainer, isRoot);
    const endCell = getClosestCell(rng.endContainer, isRoot);
    const startTableSelection = startCell
      .bind(getCellRangeFromStartTable(isRoot))
      .bind(getTableSelectionFromCellRng(isRoot));
    const endTableSelection = endCell
      .bind(getCellRangeFromEndTable(isRoot))
      .bind(getTableSelectionFromCellRng(isRoot));
    return {
      start: startTableSelection,
      end: endTableSelection
    };
  }
};

const getCellIndex = <T> (cells: SugarElement<T>[], cell: SugarElement<T>): (number) | null =>
  (cells).findIndex((x) => Compare.eq(x, cell));

const getSelectedCells = (tableSelection: TableSelection) => (getCellIndex(tableSelection.cells, tableSelection.rng.start) !== null && getCellIndex(tableSelection.cells, tableSelection.rng.end) !== null ? ((startIndex, endIndex) => tableSelection.cells.slice(startIndex, endIndex + 1))(getCellIndex(tableSelection.cells, tableSelection.rng.start), getCellIndex(tableSelection.cells, tableSelection.rng.end)) : null);

const isSingleCellTableContentSelected = (optCellRng: (TableCellRng) | null, rng: Range, isRoot: IsRootFn): boolean =>
  optCellRng.exists((cellRng) => isSingleCellTable(cellRng, isRoot) && SelectionUtils.hasAllContentsSelected(cellRng.start, rng));

const unselectCells = (rng: Range, selectionDetails: SelectionDetails): Range => {
  const { startTable, endTable } = selectionDetails;
  const otherContentRng = rng.cloneRange();
  // If the table is some, it should be unselected (works for single table and multitable cases)
  startTable.each((table) => otherContentRng.setStartAfter(table.dom));
  endTable.each((table) => otherContentRng.setEndBefore(table.dom));
  return otherContentRng;
};

const handleSingleTable = (cellRng: (TableCellRng) | null, selectionDetails: SelectionDetails, rng: Range, isRoot: IsRootFn): (DeleteActionAdt) | null =>
  getTableSelections(cellRng, selectionDetails, rng, isRoot)
    .bind(({ start, end }) => start.or(end))
    .bind((tableSelection) => {
      const { isSameTable } = selectionDetails;
      const selectedCells = getSelectedCells(tableSelection) ?? ([]);
      if (isSameTable && tableSelection.cells.length === selectedCells.length) {
        return deleteAction.fullTable(tableSelection.table);
      } else if (selectedCells.length > 0) {
        if (isSameTable) {
          return deleteAction.partialTable(selectedCells, null);
        } else {
          const otherContentRng = unselectCells(rng, selectionDetails);
          return deleteAction.partialTable(selectedCells, {
            ...selectionDetails,
            rng: otherContentRng
          });
        }
      } else {
        return null;
      }
    });

const handleMultiTable = (cellRng: (TableCellRng) | null, selectionDetails: SelectionDetails, rng: Range, isRoot: IsRootFn): (DeleteActionAdt) | null =>
  getTableSelections(cellRng, selectionDetails, rng, isRoot)
    .bind(({ start, end }) => {
      const startTableSelectedCells = start.bind(getSelectedCells) ?? ([]);
      const endTableSelectedCells = end.bind(getSelectedCells) ?? ([]);
      if (startTableSelectedCells.length > 0 && endTableSelectedCells.length > 0) {
        const otherContentRng = unselectCells(rng, selectionDetails);
        return deleteAction.multiTable(startTableSelectedCells, endTableSelectedCells, otherContentRng);
      } else {
        return null;
      }
    });

const getActionFromRange = (root: SugarElement<Node>, rng: Range): (DeleteActionAdt) | null => {
  const isRoot = TableDeleteUtils.isRootFromElement(root);
  const optCellRng = getCellRng(rng, isRoot);
  const selectionDetails = TableDeleteUtils.getTableDetailsFromRange(rng, isRoot);

  if (isSingleCellTableContentSelected(optCellRng, rng, isRoot)) {
    // SingleCellTable
    return optCellRng.map((cellRng) => deleteAction.singleCellTable(rng, cellRng.start));
  } else if (selectionDetails.isMultiTable) {
    // MultiTable
    return handleMultiTable(optCellRng, selectionDetails, rng, isRoot);
  } else {
    // FullTable, PartialTable with no rng or PartialTable with outside rng
    return handleSingleTable(optCellRng, selectionDetails, rng, isRoot);
  }
};

export {
  getActionFromRange
};
