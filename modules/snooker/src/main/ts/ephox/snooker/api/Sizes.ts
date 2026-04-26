import { Css, Height, SugarElement, Width } from '@ephox/sugar';

import * as ColumnSizes from '../resize/ColumnSizes';
import * as Redistribution from '../resize/Redistribution';
import * as Sizes from '../resize/Sizes';
import * as CellUtils from '../util/CellUtils';
import { DetailExt, RowDetail, Column, Detail } from './Structs';
import { Warehouse } from './Warehouse';

const redistributeToW = (newWidths: string[], cells: DetailExt[], unit: string): void => {
  (cells).forEach((cell) => {
    const widths = newWidths.slice(cell.column, cell.colspan + cell.column);
    const w = Redistribution.sum(widths, CellUtils.minWidth());
    Css.set(cell.element, 'width', w + unit);
  });
};

const redistributeToColumns = (newWidths: string[], columns: Column[], unit: string): void => {
  (columns).forEach((column, index: number) => {
    const width = Redistribution.sum([ newWidths[index] ], CellUtils.minWidth());
    Css.set(column.element, 'width', width + unit);
  });
};

const redistributeToH = <T extends Detail> (newHeights: string[], rows: RowDetail<T>[], cells: DetailExt[]): void => {
  (cells).forEach((cell) => {
    Css.remove(cell.element, 'height');
  });

  (rows).forEach((row, i) => {
    Css.set(row.element, 'height', newHeights[i]);
  });
};

const getUnit = (newSize: string): 'px' | '%' => {
  return Redistribution.validate(newSize).fold(() => 'px', () => 'px', () => '%');
};

// Procedure to resize table dimensions to optWidth x optHeight and redistribute cell and row dimensions.
// Updates CSS of the table, rows, and cells.
const redistribute = (table: SugarElement<HTMLTableElement>, optWidth: (string) | null, optHeight: (string) | null): void => {
  const warehouse = Warehouse.fromTable(table);
  const rows = warehouse.all;
  const cells = Warehouse.justCells(warehouse);
  const columns = Warehouse.justColumns(warehouse);

  optWidth.each((newWidth) => {
    const widthUnit = getUnit(newWidth);
    const totalWidth = Width.get(table);
    const oldWidths = ColumnSizes.getRawWidths(warehouse, table);
    const nuWidths = Redistribution.redistribute(oldWidths, totalWidth, newWidth);

    if (Warehouse.hasColumns(warehouse)) {
      redistributeToColumns(nuWidths, columns, widthUnit);
    } else {
      redistributeToW(nuWidths, cells, widthUnit);
    }

    Css.set(table, 'width', newWidth);
  });

  optHeight.each((newHeight) => {
    const totalHeight = Height.get(table);
    const oldHeights = ColumnSizes.getRawHeights(warehouse, table);
    const nuHeights = Redistribution.redistribute(oldHeights, totalHeight, newHeight);
    redistributeToH(nuHeights, rows, cells);
    Css.set(table, 'height', newHeight);
  });
};

const isPercentSizing = Sizes.isPercentSizing;
const isPixelSizing = Sizes.isPixelSizing;
const isNoneSizing = Sizes.isNoneSizing;

const getPercentTableWidth = Sizes.getPercentTableWidth;
const getPercentTableHeight = Sizes.getPercentTableHeight;

export {
  getPercentTableWidth,
  getPercentTableHeight,
  isPercentSizing,
  isPixelSizing,
  isNoneSizing,
  redistribute
};
