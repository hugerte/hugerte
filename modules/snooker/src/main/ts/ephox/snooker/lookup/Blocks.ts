import { SugarElement } from '@ephox/sugar';

import { DetailExt } from '../api/Structs';
import { Warehouse } from '../api/Warehouse';

type ValidCellFn = (cell: SugarElement<HTMLTableCellElement>) => boolean;

/*
 * Identify for each column, a cell that has colspan 1. Note, this
 * may actually fail, and future work will be to calculate column
 * sizes that are only available through the difference of two
 * spanning columns.
 */
const columns = (warehouse: Warehouse, isValidCell: ValidCellFn = (() => true as const)): (SugarElement<HTMLTableCellElement>) | null[] => {
  const grid = warehouse.grid;
  const cols = Array.from({length: grid.columns}, (_, _i) => ((x: any) => x)(_i));
  const rowsArr = Array.from({length: grid.rows}, (_, _i) => ((x: any) => x)(_i));

  return (cols).map((col) => {
    const getBlock = () =>
      (rowsArr).flatMap((r) =>
        Warehouse.getAt(warehouse, r, col)
          .filter((detail) => detail.column === col)
          .toArray());

    const isValid = (detail: DetailExt) => detail.colspan === 1 && isValidCell(detail.element);
    const getFallback = () => Warehouse.getAt(warehouse, 0, col);
    return decide(getBlock, isValid, getFallback);
  });
};

const decide = (
  getBlock: () => DetailExt[],
  isValid: (detail: DetailExt) => boolean,
  getFallback: () => (DetailExt) | null
): (SugarElement<HTMLTableCellElement>) | null => {
  const inBlock = getBlock();
  const validInBlock = ((inBlock).find(isValid) ?? null);
  const detailOption = validInBlock.orThunk(() => (inBlock[0] ?? null).orThunk(getFallback));
  return detailOption.map((detail) => detail.element);
};

const rows = (warehouse: Warehouse): (SugarElement<HTMLTableCellElement>) | null[] => {
  const grid = warehouse.grid;
  const rowsArr = Array.from({length: grid.rows}, (_, _i) => ((x: any) => x)(_i));
  const cols = Array.from({length: grid.columns}, (_, _i) => ((x: any) => x)(_i));

  return (rowsArr).map((row) => {
    const getBlock = () => (cols).flatMap((c) => Warehouse.getAt(warehouse, row, c)
      .filter((detail) => detail.row === row)
      .fold(() => [] as DetailExt[], (detail) => [ detail ]));

    const isSingle = (detail: DetailExt) => detail.rowspan === 1;
    const getFallback = () => Warehouse.getAt(warehouse, row, 0);
    return decide(getBlock, isSingle, getFallback);
  });

};

export { columns, rows };
