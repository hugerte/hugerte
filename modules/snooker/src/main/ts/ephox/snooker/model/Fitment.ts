import { Arr, Result } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { SimpleGenerators } from '../api/Generators';
import * as Structs from '../api/Structs';
import * as LockedColumnUtils from '../util/LockedColumnUtils';
import { CellElement } from '../util/TableTypes';
import * as GridRow from './GridRow';

export interface Delta {
  readonly colDelta: number;
  readonly rowDelta: number;
}

/*
  Fitment, is a module used to ensure that the Inserted table (gridB) can fit squareley within the Host table (gridA).
    - measure returns a delta of rows and cols, eg:
        - col: 3 means gridB can fit with 3 spaces to spare
        - row: -5 means gridB can needs 5 more rows to completely fit into gridA
        - col: 0, row: 0 depics perfect fitment

    - tailor, requires a delta and returns grid that is built to match the delta, tailored to fit.
      eg: 3x3 gridA, with a delta col: -3, row: 2 returns a new grid 3 rows x 6 cols

    - assumptions: All grids used by this module should be rectangular
*/

const measure = (startAddress: Structs.Address, gridA: Structs.RowCells[], gridB: Structs.RowCells[]): Result<Delta, string> => {
  if (startAddress.row >= gridA.length || startAddress.column > GridRow.cellLength(gridA[0])) {
    return Result.error(
      'invalid start address out of table bounds, row: ' + startAddress.row + ', column: ' + startAddress.column
    );
  }
  const rowRemainder = gridA.slice(startAddress.row);
  const colRemainder = rowRemainder[0].cells.slice(startAddress.column);

  const colRequired = GridRow.cellLength(gridB[0]);
  const rowRequired = gridB.length;
  return Result.value({
    rowDelta: rowRemainder.length - rowRequired,
    colDelta: colRemainder.length - colRequired
  });
};

const measureWidth = (gridA: Structs.RowCells[], gridB: Structs.RowCells[]): Delta => {
  const colLengthA = GridRow.cellLength(gridA[0]);
  const colLengthB = GridRow.cellLength(gridB[0]);

  return {
    rowDelta: 0,
    colDelta: colLengthA - colLengthB
  };
};

const measureHeight = (gridA: Structs.RowCells[], gridB: Structs.RowCells[]): Delta => {
  const rowLengthA = gridA.length;
  const rowLengthB = gridB.length;

  return {
    rowDelta: rowLengthA - rowLengthB,
    colDelta: 0
  };
};

const generateElements = (amount: number, row: Structs.RowCells, generators: SimpleGenerators, isLocked: (idx: number) => boolean): Structs.ElementNew[] => {
  const generator = row.section === 'colgroup' ? generators.col : generators.cell;
  return Array.from({length: amount}, (_, _i) => ((idx) => Structs.elementnew(generator() as SugarElement<CellElement>, true, isLocked(idx)))(_i));
};

const rowFill = (grid: Structs.RowCells[], amount: number, generators: SimpleGenerators, lockedColumns: Record<string, boolean>): Structs.RowCells[] => {
  const exampleRow = grid[grid.length - 1];
  return grid.concat(Array.from({length: amount}, (_, _i) => (() => {
    const generator = exampleRow.section === 'colgroup' ? generators.colgroup : generators.row;
    const row = GridRow.clone(exampleRow, generator, (x: any) => x);
    const elements = generateElements(row.cells.length, row, generators, (idx) => Object.prototype.hasOwnProperty.call(lockedColumns, idx.toString()));
    return GridRow.setCells(row, elements);
  })(_i)));
};

const colFill = (grid: Structs.RowCells[], amount: number, generators: SimpleGenerators, startIndex: number): Structs.RowCells[] =>
  (grid).map((row) => {
    const newChildren = generateElements(amount, row, generators, (() => false as const));
    return GridRow.addCells(row, startIndex, newChildren);
  });

const lockedColFill = (grid: Structs.RowCells[], generators: SimpleGenerators, lockedColumns: number[]): Structs.RowCells[] =>
  (grid).map((row) => {
    return (lockedColumns).reduce((acc, colNum) => {
      const newChild = generateElements(1, row, generators, (() => true as const))[0];
      return GridRow.addCell(acc, colNum, newChild);
    }, row);
  });

const tailor = (gridA: Structs.RowCells[], delta: Delta, generators: SimpleGenerators): Structs.RowCells[] => {
  const fillCols = delta.colDelta < 0 ? colFill : (x: any) => x;
  const fillRows = delta.rowDelta < 0 ? rowFill : (x: any) => x;
  const lockedColumns = LockedColumnUtils.getLockedColumnsFromGrid(gridA);
  const gridWidth = GridRow.cellLength(gridA[0]);
  const isLastColLocked = (lockedColumns).some((locked) => locked === gridWidth - 1);
  const modifiedCols = fillCols(gridA, Math.abs(delta.colDelta), generators, isLastColLocked ? gridWidth - 1 : gridWidth);
  // Need to recalculate locked column positions
  const newLockedColumns = LockedColumnUtils.getLockedColumnsFromGrid(modifiedCols);
  return fillRows(modifiedCols, Math.abs(delta.rowDelta), generators, Arr.mapToObject(newLockedColumns, (() => true as const)));
};

export { measure, measureWidth, measureHeight, tailor, lockedColFill };
