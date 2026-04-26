import { PlatformDetection } from '@ephox/sand';
import { SugarElement, SugarNode, Width } from '@ephox/sugar';

import { TableSize } from '../api/TableSize';
import { Warehouse } from '../api/Warehouse';
import * as Blocks from '../lookup/Blocks';
import * as CellUtils from '../util/CellUtils';
import { CellElement } from '../util/TableTypes';
import * as Util from '../util/Util';
import { height, width } from './BarPositions';
import * as Sizes from './Sizes';

const isCol = SugarNode.isTag('col');

const getRawW = (cell: SugarElement<HTMLTableCellElement | HTMLTableColElement>): string => {
  return Sizes.getRawWidth(cell).getOrThunk(() => Sizes.getPixelWidth(cell) + 'px');
};

const getRawH = (cell: SugarElement<HTMLTableCellElement | HTMLTableRowElement>): string => {
  return Sizes.getRawHeight(cell).getOrThunk(() => Sizes.getHeight(cell) + 'px');
};

const justCols = (warehouse: Warehouse): (SugarElement<HTMLTableColElement>) | null[] =>
  (Warehouse.justColumns(warehouse)).map((column) => (column.element ?? null));

// Col elements don't have valid computed widths/positions in all browsers, so treat them as invalid in that case
const isValidColumn = (cell: SugarElement<HTMLTableCellElement | HTMLTableColElement>): boolean => {
  const browser = PlatformDetection.detect().browser;
  const supportsColWidths = browser.isChromium() || browser.isFirefox();
  return isCol(cell) ? supportsColWidths : true;
};

const getDimension = <T extends HTMLElement, U>(
  cellOpt: (SugarElement<T>) | null,
  index: number,
  backups: (number) | null[],
  filter: (cell: SugarElement<T>) => boolean,
  getter: (cell: SugarElement<T>) => U,
  fallback: (deduced: (number) | null) => U
): U =>
  cellOpt.filter(filter).fold(
    // Can't just read the width of a cell, so calculate.
    () => fallback(Util.deduce(backups, index)),
    (cell) => getter(cell)
  );

const getWidthFrom = <T>(
  warehouse: Warehouse,
  table: SugarElement<HTMLTableElement>,
  getWidth: (cell: SugarElement<CellElement>) => T,
  fallback: (deduced: (number) | null) => T
): T[] => {
  // Only treat a cell as being valid for a column representation if it has a raw width, otherwise we won't be able to calculate the expected width.
  // This is needed as one cell may have a width but others may not, so we need to try and use one with a specified width first.
  const columnCells = Blocks.columns(warehouse);
  const columns: (SugarElement<HTMLTableCellElement | HTMLTableColElement>) | null[] = Warehouse.hasColumns(warehouse) ? justCols(warehouse) : columnCells;

  const backups = [ width.edge(table) ].concat((width.positions(columnCells, table)).map((pos) =>
    pos.map((p) => p.x)));

  // Only use the width of cells that have no column span (or colspan 1)
  const colFilter = (x: any) => !(CellUtils.hasColspan)(x);

  return (columns).map((cellOption, c) => {
    return getDimension(cellOption, c, backups, colFilter, (column) => {
      if (isValidColumn(column)) {
        return getWidth(column);
      } else {
        // Invalid column so fallback to trying to get the computed width from the cell
        const cell = (columnCells[c] != null ? ((x: any) => x)(columnCells[c]) : null);
        return getDimension(cell, c, backups, colFilter, (cell) => fallback(Width.get(cell)), fallback);
      }
    }, fallback);
  });
};

const getDeduced = (deduced: (number) | null): string => {
  return deduced.map((d) => {
    return d + 'px';
  }) ?? ('');
};

const getRawWidths = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>): string[] => {
  return getWidthFrom(warehouse, table, getRawW, getDeduced);
};

const getPercentageWidths = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, tableSize: TableSize): number[] => {
  return getWidthFrom(warehouse, table, Sizes.getPercentageWidth, (deduced) => {
    return deduced.fold(() => {
      return tableSize.minCellWidth();
    }, (cellWidth) => {
      return cellWidth / tableSize.pixelWidth() * 100;
    });
  });
};

const getPixelWidths = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, tableSize: TableSize): number[] => {
  return getWidthFrom(warehouse, table, Sizes.getPixelWidth, (deduced) => {
    // Minimum cell width when all else fails.
    return deduced.getOrThunk(tableSize.minCellWidth);
  });
};

const getHeightFrom = <T> (
  warehouse: Warehouse,
  table: SugarElement<HTMLTableElement>,
  getHeight: (cell: SugarElement<HTMLTableCellElement | HTMLTableRowElement>) => T,
  fallback: (deduced: (number) | null) => T
): T[] => {
  const rowCells = Blocks.rows(warehouse);
  const rows = (warehouse.all).map((r) => r.element);

  const backups = [ height.edge(table) ].concat((height.positions(rowCells, table)).map((pos) =>
    pos.map((p) => p.y)));

  return (rows).map((row, i) =>
    getDimension(
      row,
      i,
      backups,
      (() => true as const),
      getHeight,
      fallback
    ));
};

const getPixelHeights = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>): number[] => {
  return getHeightFrom(warehouse, table, Sizes.getHeight, (deduced: (number) | null) => {
    return deduced.getOrThunk(CellUtils.minHeight);
  });
};

const getRawHeights = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>): string[] => {
  return getHeightFrom(warehouse, table, getRawH, getDeduced);
};

export { getRawWidths, getPixelWidths, getPercentageWidths, getPixelHeights, getRawHeights };

