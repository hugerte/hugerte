import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import { Warehouse } from '../api/Warehouse';
import { CellElement } from '../util/TableTypes';

export type RowHeaderType = 'section' | 'cells' | 'sectionCells';
export type RowType = 'header' | 'body' | 'footer';

interface RowDetails {
  readonly type: RowType;
  readonly subType?: string;
}

interface CommonCellDetails {
  readonly element: SugarElement<CellElement>;
}

interface CommonRowDetails {
  readonly cells: CommonCellDetails[];
  readonly section: Structs.Section;
}

const isHeaderCell = SugarNode.isTag('th');

const isHeaderCells = (cells: CommonCellDetails[]): boolean =>
  (cells).every((cell) => isHeaderCell(cell.element));

const getRowHeaderType = (isHeaderRow: boolean, isHeaderCells: boolean): RowHeaderType => {
  if (isHeaderRow && isHeaderCells) {
    return 'sectionCells';
  } else if (isHeaderRow) {
    return 'section';
  } else {
    return 'cells';
  }
};

const getRowType = (row: CommonRowDetails): RowDetails => {
  // Header rows can use a combination of theads and ths - want to detect the different combinations
  const isHeaderRow = row.section === 'thead';
  const isHeaderCells = (findCommonCellType(row.cells) !== null && (findCommonCellType(row.cells)) === ('th'));
  if (row.section === 'tfoot') {
    return { type: 'footer' };
  } else if (isHeaderRow || isHeaderCells) {
    return { type: 'header', subType: getRowHeaderType(isHeaderRow, isHeaderCells) };
  } else {
    return { type: 'body' };
  }
};

const findCommonCellType = (cells: CommonCellDetails[]): ('td' | 'th') | null => {
  const headerCells = (cells).filter((cell) => isHeaderCell(cell.element));
  if (headerCells.length === 0) {
    return 'td';
  } else if (headerCells.length === cells.length) {
    return 'th';
  } else {
    return null;
  }
};

const findCommonRowType = (rows: CommonRowDetails[]): (RowType) | null => {
  const rowTypes = (rows).map((row) => getRowType(row).type);
  const hasHeader = (rowTypes).includes('header');
  const hasFooter = (rowTypes).includes('footer');
  if (!hasHeader && !hasFooter) {
    return 'body';
  } else {
    const hasBody = (rowTypes).includes('body');
    if (hasHeader && !hasBody && !hasFooter) {
      return 'header';
    } else if (!hasHeader && !hasBody && hasFooter) {
      return 'footer';
    } else {
      return null;
    }
  }
};

const findTableRowHeaderType = (warehouse: Warehouse): (RowHeaderType) | null =>
  Arr.findMap(warehouse.all, (row) => {
    const rowType = getRowType(row);
    return rowType.type === 'header' ? (rowType.subType as RowHeaderType ?? null) : null;
  });

export {
  findCommonCellType,
  findCommonRowType,
  findTableRowHeaderType,
  isHeaderCell,
  isHeaderCells
};
