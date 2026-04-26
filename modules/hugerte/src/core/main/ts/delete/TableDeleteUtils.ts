import { Compare, PredicateExists, SelectorFilter, SugarElement } from '@ephox/sugar';

import * as TableCellSelection from '../selection/TableCellSelection';

export type IsRootFn = (e: SugarElement<Node>) => boolean;

export interface TableSelectionDetails {
  readonly startTable: (SugarElement<HTMLTableElement>) | null;
  readonly endTable: (SugarElement<HTMLTableElement>) | null;
  readonly isStartInTable: boolean;
  readonly isEndInTable: boolean;
  readonly isSameTable: boolean;
  readonly isMultiTable: boolean;
}

const isRootFromElement = (root: SugarElement<Node>): IsRootFn =>
  (cur: SugarElement<Node>): boolean => Compare.eq(root, cur);

const getTableCells = (table: SugarElement<HTMLTableElement>): SugarElement<HTMLTableCellElement>[] =>
  SelectorFilter.descendants<HTMLTableCellElement>(table, 'td,th');

const getTable = (node: Node, isRoot: IsRootFn) => TableCellSelection.getClosestTable(SugarElement.fromDom(node), isRoot);

const selectionInTableWithNestedTable = (details: TableSelectionDetails): TableSelectionDetails => {
  return (details.startTable !== null && details.endTable !== null ? ((startTable, endTable) => {
    const isStartTableParentOfEndTable = PredicateExists.descendant(startTable, (t) => Compare.eq(t, endTable));
    const isEndTableParentOfStartTable = PredicateExists.descendant(endTable, (t) => Compare.eq(t, startTable));

    return !isStartTableParentOfEndTable && !isEndTableParentOfStartTable ? details : {
      ...details,
      startTable: isStartTableParentOfEndTable ? null : details.startTable,
      endTable: isEndTableParentOfStartTable ? null : details.endTable,
      isSameTable: false,
      isMultiTable: false
    };
  })(details.startTable, details.endTable) : null) ?? (details);
};

const adjustQuirksInDetails = (details: TableSelectionDetails): TableSelectionDetails => {
  return selectionInTableWithNestedTable(details);
};

const getTableDetailsFromRange = (rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  const startTable = getTable(rng.startContainer, isRoot);
  const endTable = getTable(rng.endContainer, isRoot);
  const isStartInTable = startTable !== null;
  const isEndInTable = endTable !== null;
  // Partial selection - selection is not within the same table
  const isSameTable = (startTable !== null && endTable !== null ? (Compare.eq)(startTable, endTable) : null) ?? (false);
  const isMultiTable = !isSameTable && isStartInTable && isEndInTable;

  return adjustQuirksInDetails({
    startTable,
    endTable,
    isStartInTable,
    isEndInTable,
    isSameTable,
    isMultiTable
  });
};

export {
  getTableDetailsFromRange,
  isRootFromElement,
  getTableCells
};
