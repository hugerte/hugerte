/*
 NOTE: This file is partially duplicated in the following locations:
  - models/dom/table/queries/TableTargets.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import { CellOpSelection } from "@hugerte/darwin";
import { Optional } from "@hugerte/katamari";
import { RunOperation } from "@hugerte/snooker";
import { SugarElement } from "@hugerte/sugar";

import { ephemera } from '../selection/Ephemera';

const noMenu = (cell: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>): RunOperation.CombinedTargets => ({
  element: cell,
  mergable: Optional.none(),
  unmergable: Optional.none(),
  selection: [ cell ]
});

const forMenu = (selectedCells: SugarElement<HTMLTableCellElement>[], table: SugarElement<HTMLTableElement>, cell: SugarElement<HTMLTableCellElement>): RunOperation.CombinedTargets => ({
  element: cell,
  mergable: CellOpSelection.mergable(table, selectedCells, ephemera),
  unmergable: CellOpSelection.unmergable(selectedCells),
  selection: CellOpSelection.selection(selectedCells)
});

export {
  noMenu,
  forMenu
};

