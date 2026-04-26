/*
 NOTE: This file is partially duplicated in the following locations:
  - plugins/table/selection/TableSelection.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import { TableSelection } from '@ephox/darwin';
import { TableLookup } from '@ephox/snooker';
import { SelectorFind, Selectors, SugarElement, SugarElements, SugarNode } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';

import { ephemera } from './Ephemera';

const getSelectionCellFallback = (element: SugarElement<Node>) =>
  TableLookup.table(element).bind((table) =>
    TableSelection.retrieve(table, ephemera.firstSelectedSelector)
  ).fold(() => element, (cells) => cells[0]);

const getSelectionFromSelector = <T extends Element>(selector: string) =>
  (initCell: SugarElement<Node>, isRoot?: (el: SugarElement<Node>) => boolean) => {
    const cellName = SugarNode.name(initCell);
    const cell = cellName === 'col' || cellName === 'colgroup' ? getSelectionCellFallback(initCell) : initCell;
    return SelectorFind.closest<T>(cell, selector, isRoot);
  };

const getSelectionCellOrCaption = getSelectionFromSelector<HTMLTableCellElement | HTMLTableCaptionElement>('th,td,caption');

const getSelectionCell = getSelectionFromSelector<HTMLTableCellElement>('th,td');

// Note: Includes single cell if the start of the selection whether collapsed or ranged is within a table cell
const getCellsFromSelection = (editor: Editor): SugarElement<HTMLTableCellElement>[] =>
  SugarElements.fromDom(editor.model.table.getSelectedCells());

const getCellsFromFakeSelection = (editor: Editor): SugarElement<HTMLTableCellElement>[] =>
  (getCellsFromSelection(editor)).filter((cell) => Selectors.is(cell, ephemera.selectedSelector));

export {
  getSelectionCell,
  getSelectionCellOrCaption,
  getCellsFromSelection,
  getCellsFromFakeSelection
};
