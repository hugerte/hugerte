import { Optional } from '@ephox/katamari';
import { DomDescent } from '@ephox/phoenix';
import {
  CellMutations, ResizeBehaviour, RunOperation, TableFill, TableGridSize, TableSection, TableOperations, TableLookup
} from '@ephox/snooker';
import { Attribute, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';
import { TableEventData } from 'hugerte/core/api/EventTypes';

import * as Events from '../api/Events';
import * as Options from '../api/Options';
import { TableCellSelectionHandler } from '../api/TableCellSelectionHandler';
import { TableResizeHandler } from '../api/TableResizeHandler';
import * as Utils from '../core/TableUtils';
import * as TableSize from '../queries/TableSize';

type TableAction<T> = (table: SugarElement<HTMLTableElement>, target: T, noEvents?: boolean) => (TableActionResult) | null;
export interface TableActionResult {
  readonly rng: Range;
  readonly effect: TableEventData;
}
export type CombinedTargetsTableAction = TableAction<RunOperation.CombinedTargets>;
export type PasteTableAction = TableAction<RunOperation.TargetPaste>;
export type AdvancedPasteTableAction = TableAction<RunOperation.TargetPasteRows>;
export type LookupAction = (table: SugarElement<HTMLTableElement>, target: RunOperation.TargetSelection) => string;

type GuardFn = (table: SugarElement<HTMLTableElement>) => boolean;
type MutateFn = (e1: SugarElement<HTMLTableCellElement | HTMLTableColElement>, e2: SugarElement<HTMLTableCellElement | HTMLTableColElement>) => void;

export interface TableActions {
  readonly deleteRow: CombinedTargetsTableAction;
  readonly deleteColumn: CombinedTargetsTableAction;
  readonly insertRowsBefore: CombinedTargetsTableAction;
  readonly insertRowsAfter: CombinedTargetsTableAction;
  readonly insertColumnsBefore: CombinedTargetsTableAction;
  readonly insertColumnsAfter: CombinedTargetsTableAction;
  readonly mergeCells: CombinedTargetsTableAction;
  readonly unmergeCells: CombinedTargetsTableAction;
  readonly pasteCells: PasteTableAction;
  readonly pasteColsBefore: AdvancedPasteTableAction;
  readonly pasteColsAfter: AdvancedPasteTableAction;
  readonly pasteRowsBefore: AdvancedPasteTableAction;
  readonly pasteRowsAfter: AdvancedPasteTableAction;
  readonly makeCellsHeader: CombinedTargetsTableAction;
  readonly unmakeCellsHeader: CombinedTargetsTableAction;
  readonly makeColumnsHeader: CombinedTargetsTableAction;
  readonly unmakeColumnsHeader: CombinedTargetsTableAction;
  readonly makeRowsHeader: CombinedTargetsTableAction;
  readonly makeRowsBody: CombinedTargetsTableAction;
  readonly makeRowsFooter: CombinedTargetsTableAction;
  readonly getTableRowType: LookupAction;
  readonly getTableCellType: LookupAction;
  readonly getTableColType: LookupAction;
}

export const TableActions = (editor: Editor, resizeHandler: TableResizeHandler, cellSelectionHandler: TableCellSelectionHandler): TableActions => {
  const isTableBody = (editor: Editor): boolean =>
    SugarNode.name(Utils.getBody(editor)) === 'table';

  const lastRowGuard = (table: SugarElement<HTMLTableElement>): boolean =>
    !isTableBody(editor) || TableGridSize.getGridSize(table).rows > 1;

  const lastColumnGuard = (table: SugarElement<HTMLTableElement>): boolean =>
    !isTableBody(editor) || TableGridSize.getGridSize(table).columns > 1;

  // Optional.none gives the default cloneFormats.
  const cloneFormats = Options.getTableCloneElements(editor);

  const colMutationOp = Options.isResizeTableColumnResizing(editor) ? () => {} : CellMutations.halve;

  const getTableSectionType = (table: SugarElement<HTMLTableElement>) => {
    switch (Options.getTableHeaderType(editor)) {
      case 'section':
        return TableSection.section();
      case 'sectionCells':
        return TableSection.sectionCells();
      case 'cells':
        return TableSection.cells();
      default:
        // Attempt to automatically find the type. If a type can't be found
        // then fallback to "section" to maintain backwards compatibility.
        return TableSection.getTableSectionType(table, 'section');
    }
  };

  const setSelectionFromAction = (table: SugarElement<HTMLTableElement>, result: RunOperation.RunOperationOutput) =>
    result.cursor.fold(() => {
      // Snooker has reported we don't have a good cursor position. However, we may have a locked column
      // with noneditable cells, so lets check if we have a noneditable cell and if so place the selection
      const cells = TableLookup.cells(table);
      return ((cells)[0] ?? null).filter(SugarBody.inBody).map((firstCell) => {
        cellSelectionHandler.clearSelectedCells(table.dom);
        const rng = editor.dom.createRng();
        rng.selectNode(firstCell.dom);
        editor.selection.setRng(rng);
        Attribute.set(firstCell, 'data-mce-selected', '1');
        return rng;
      });
    }, (cell) => {
      const des = DomDescent.freefallRtl(cell);
      const rng = editor.dom.createRng();
      rng.setStart(des.element.dom, des.offset);
      rng.setEnd(des.element.dom, des.offset);
      editor.selection.setRng(rng);
      cellSelectionHandler.clearSelectedCells(table.dom);
      return rng;
    });

  const execute = <T> (operation: RunOperation.OperationCallback<T>, guard: GuardFn, mutate: MutateFn, effect: TableEventData) =>
    (table: SugarElement<HTMLTableElement>, target: T, noEvents: boolean = false): (TableActionResult) | null => {
      Utils.removeDataStyle(table);
      const doc = SugarElement.fromDom(editor.getDoc());
      const generators = TableFill.cellOperations(mutate, doc, cloneFormats);
      const behaviours: RunOperation.OperationBehaviours = {
        sizing: TableSize.get(editor, table),
        resize: Options.isResizeTableColumnResizing(editor) ? ResizeBehaviour.resizeTable() : ResizeBehaviour.preserveTable(),
        section: getTableSectionType(table)
      };
      return guard(table) ? operation(table, target, generators, behaviours).bind((result) => {
        // Update the resize bars after the table operation
        resizeHandler.refresh(table.dom);

        // INVESTIGATE: Should "noEvents" prevent these from firing as well?
        (result.newRows).forEach((row) => {
          Events.fireNewRow(editor, row.dom);
        });
        (result.newCells).forEach((cell) => {
          Events.fireNewCell(editor, cell.dom);
        });

        const range = setSelectionFromAction(table, result);

        if (SugarBody.inBody(table)) {
          Utils.removeDataStyle(table);
          if (!noEvents) {
            Events.fireTableModified(editor, table.dom, effect);
          }
        }

        return range.map((rng) => ({
          rng,
          effect
        }));
      }) : null;
    };

  const deleteRow = execute(TableOperations.eraseRows, lastRowGuard, () => {}, Events.structureModified);

  const deleteColumn = execute(TableOperations.eraseColumns, lastColumnGuard, () => {}, Events.structureModified);

  const insertRowsBefore = execute(TableOperations.insertRowsBefore, (() => true as const), () => {}, Events.structureModified);

  const insertRowsAfter = execute(TableOperations.insertRowsAfter, (() => true as const), () => {}, Events.structureModified);

  const insertColumnsBefore = execute(TableOperations.insertColumnsBefore, (() => true as const), colMutationOp, Events.structureModified);

  const insertColumnsAfter = execute(TableOperations.insertColumnsAfter, (() => true as const), colMutationOp, Events.structureModified);

  const mergeCells = execute(TableOperations.mergeCells, (() => true as const), () => {}, Events.structureModified);

  const unmergeCells = execute(TableOperations.unmergeCells, (() => true as const), () => {}, Events.structureModified);

  const pasteColsBefore = execute(TableOperations.pasteColsBefore, (() => true as const), () => {}, Events.structureModified);

  const pasteColsAfter = execute(TableOperations.pasteColsAfter, (() => true as const), () => {}, Events.structureModified);

  const pasteRowsBefore = execute(TableOperations.pasteRowsBefore, (() => true as const), () => {}, Events.structureModified);

  const pasteRowsAfter = execute(TableOperations.pasteRowsAfter, (() => true as const), () => {}, Events.structureModified);

  const pasteCells = execute(TableOperations.pasteCells, (() => true as const), () => {}, Events.styleAndStructureModified);

  const makeCellsHeader = execute(TableOperations.makeCellsHeader, (() => true as const), () => {}, Events.structureModified);
  const unmakeCellsHeader = execute(TableOperations.unmakeCellsHeader, (() => true as const), () => {}, Events.structureModified);

  const makeColumnsHeader = execute(TableOperations.makeColumnsHeader, (() => true as const), () => {}, Events.structureModified);
  const unmakeColumnsHeader = execute(TableOperations.unmakeColumnsHeader, (() => true as const), () => {}, Events.structureModified);

  const makeRowsHeader = execute(TableOperations.makeRowsHeader, (() => true as const), () => {}, Events.structureModified);
  const makeRowsBody = execute(TableOperations.makeRowsBody, (() => true as const), () => {}, Events.structureModified);
  const makeRowsFooter = execute(TableOperations.makeRowsFooter, (() => true as const), () => {}, Events.structureModified);

  const getTableCellType = TableOperations.getCellsType;
  const getTableColType = TableOperations.getColumnsType;
  const getTableRowType = TableOperations.getRowsType;

  return {
    deleteRow,
    deleteColumn,
    insertRowsBefore,
    insertRowsAfter,
    insertColumnsBefore,
    insertColumnsAfter,
    mergeCells,
    unmergeCells,
    pasteColsBefore,
    pasteColsAfter,
    pasteRowsBefore,
    pasteRowsAfter,
    pasteCells,
    makeCellsHeader,
    unmakeCellsHeader,
    makeColumnsHeader,
    unmakeColumnsHeader,
    makeRowsHeader,
    makeRowsBody,
    makeRowsFooter,
    getTableRowType,
    getTableCellType,
    getTableColType
  };
};
