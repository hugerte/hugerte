import { RunOperation } from '@ephox/snooker';
import { Attribute, SugarElement } from '@ephox/sugar';

import { Ephemera } from '../api/Ephemera';
import * as TableSelection from '../api/TableSelection';

const selection: (selectedCells: SugarElement<HTMLTableCellElement>[]) => SugarElement<HTMLTableCellElement>[] = (x: any) => x;

const unmergable = (selectedCells: SugarElement<HTMLTableCellElement>[]): (SugarElement<HTMLTableCellElement>[]) | null => {
  const hasSpan = (elem: SugarElement<Element>, type: 'colspan' | 'rowspan') => Attribute.getOpt(elem, type).exists((span) => parseInt(span, 10) > 1);
  const hasRowOrColSpan = (elem: SugarElement<Element>) => hasSpan(elem, 'rowspan') || hasSpan(elem, 'colspan');

  return selectedCells.length > 0 && (selectedCells).every(hasRowOrColSpan) ? selectedCells : null;
};

const mergable = (table: SugarElement<HTMLTableElement>, selectedCells: SugarElement<HTMLTableCellElement>[], ephemera: Ephemera): (RunOperation.ExtractMergable) | null => {
  if (selectedCells.length <= 1) {
    return null;
  } else {
    return TableSelection.retrieveBox(table, ephemera.firstSelectedSelector, ephemera.lastSelectedSelector)
      .map((bounds) => ({ bounds, cells: selectedCells }));
  }
};

export { mergable, unmergable, selection };

