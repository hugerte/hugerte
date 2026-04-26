import { Cell } from '@ephox/katamari';
import { RunOperation, Structs, TableLookup, Warehouse } from '@ephox/snooker';
import { Compare, SelectorExists, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';
import { Menu, Toolbar } from 'hugerte/core/api/ui/Ui';

import * as Utils from '../core/Utils';
import * as TableTargets from '../queries/TableTargets';
import * as TableSelection from './TableSelection';

type UiApi = Menu.MenuItemInstanceApi | Toolbar.ToolbarButtonInstanceApi;
type UiToggleApi = Menu.ToggleMenuItemInstanceApi | Toolbar.ToolbarToggleButtonInstanceApi;

/*
 onAny - disable if any column in the selection is locked
 onFirst - disable if the first column in the table is selected and is locked
 onLast - disable if the the last column in the table is selected and is locked
 */
export const enum LockedDisable {
  onAny = 'onAny',
  onFirst = 'onFirst',
  onLast = 'onLast'
}
type LockedDisableStrs = keyof typeof LockedDisable;

export interface SelectionTargets {
  readonly onSetupTable: (api: UiApi) => () => void;
  readonly onSetupCellOrRow: (api: UiApi) => () => void;
  readonly onSetupColumn: (lockedDisable: LockedDisable) => (api: UiApi) => () => void;
  readonly onSetupPasteable: (getClipboardData: () => (SugarElement[]) | null) => (api: UiApi) => () => void;
  readonly onSetupPasteableColumn: (getClipboardData: () => (SugarElement[]) | null, lockedDisable: LockedDisable) => (api: UiApi) => () => void;
  readonly onSetupMergeable: (api: UiApi) => () => void;
  readonly onSetupUnmergeable: (api: UiApi) => () => void;
  readonly onSetupTableWithCaption: (api: UiToggleApi) => () => void;
  readonly onSetupTableRowHeaders: (api: UiToggleApi) => () => void;
  readonly onSetupTableColumnHeaders: (api: UiToggleApi) => () => void;
  readonly resetTargets: () => void;
  readonly targets: () => (RunOperation.CombinedTargets) | null;
}

interface ExtractedSelectionDetails {
  readonly mergeable: boolean;
  readonly unmergeable: boolean;
  readonly locked: Record<LockedDisableStrs, boolean>;
}

type TargetSetupCallback = (targets: RunOperation.CombinedTargets) => boolean;

export const getSelectionTargets = (editor: Editor): SelectionTargets => {
  const targets = Cell<(RunOperation.CombinedTargets) | null>(null);
  const changeHandlers = Cell<Array<() => void>>([]);
  let selectionDetails = null;

  const isCaption = SugarNode.isTag('caption');
  const isDisabledForSelection = (key: keyof ExtractedSelectionDetails) => selectionDetails.forall((details) => !details[key]);
  const getStart = () => TableSelection.getSelectionCellOrCaption(Utils.getSelectionStart(editor), Utils.getIsRoot(editor));
  const getEnd = () => TableSelection.getSelectionCellOrCaption(Utils.getSelectionEnd(editor), Utils.getIsRoot(editor));

  const findTargets = (): (RunOperation.CombinedTargets) | null =>
    getStart().bind((startCellOrCaption) =>
      ((TableLookup.table(startCellOrCaption) !== null && getEnd().bind(TableLookup.table) !== null ? ((startTable, endTable) => {
          if (Compare.eq(startTable, endTable)) {
            if (isCaption(startCellOrCaption)) {
              return TableTargets.noMenu(startCellOrCaption);
            } else {
              return TableTargets.forMenu(TableSelection.getCellsFromSelection(editor), startTable, startCellOrCaption);
            }
          }

          return null;
        })(TableLookup.table(startCellOrCaption), getEnd().bind(TableLookup.table)) : null) ?? null)
    );

  const getExtractedDetails = (targets: RunOperation.CombinedTargets): (ExtractedSelectionDetails) | null => {
    const tableOpt = TableLookup.table(targets.element);
    return tableOpt.map((table) => {
      const warehouse = Warehouse.fromTable(table);
      const selectedCells = RunOperation.onCells(warehouse, targets) ?? ([] as Structs.DetailExt[]);

      const locked = (selectedCells).reduce((acc, cell) => {
        if (cell.isLocked) {
          acc.onAny = true;
          if (cell.column === 0) {
            acc.onFirst = true;
          } else if (cell.column + cell.colspan >= warehouse.grid.columns) {
            acc.onLast = true;
          }
        }
        return acc;
      }, { onAny: false, onFirst: false, onLast: false });

      return {
        mergeable: RunOperation.onUnlockedMergable(warehouse, targets) !== null,
        unmergeable: RunOperation.onUnlockedUnmergable(warehouse, targets) !== null,
        locked
      };
    });
  };

  const resetTargets = () => {
    // Reset the targets
    targets.set(((() => { let _called = false; let _r: any; return (..._a: any[]) => { if (!_called) { _called = true; _r = (findTargets)(..._a); } return _r; }; })())());

    // Reset the selection details
    selectionDetails = targets.get().bind(getExtractedDetails);

    // Trigger change handlers
    (changeHandlers.get()).forEach(((f: () => any) => f()));
  };

  const setupHandler = (handler: () => void) => {
    // Execute the handler to set the initial state
    handler();

    // Register the handler so we can update the state when resetting targets
    changeHandlers.set(changeHandlers.get().concat([ handler ]));

    return () => {
      changeHandlers.set((changeHandlers.get()).filter((h) => h !== handler));
    };
  };

  const onSetup = (api: UiApi, isDisabled: TargetSetupCallback) =>
    setupHandler(() =>
      targets.get().fold(() => {
        api.setEnabled(false);
      }, (targets) => {
        api.setEnabled(!isDisabled(targets) && editor.selection.isEditable());
      })
    );

  const onSetupWithToggle = (api: UiToggleApi, isDisabled: TargetSetupCallback, isActive: TargetSetupCallback) =>
    setupHandler(() =>
      targets.get().fold(() => {
        api.setEnabled(false);
        api.setActive(false);
      }, (targets) => {
        api.setEnabled(!isDisabled(targets) && editor.selection.isEditable());
        api.setActive(isActive(targets));
      })
    );

  const isDisabledFromLocked = (lockedDisable: LockedDisable) =>
    selectionDetails.exists((details) => details.locked[lockedDisable]);

  const onSetupTable = (api: UiApi) => onSetup(api, (_) => false);
  const onSetupCellOrRow = (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element));
  const onSetupColumn = (lockedDisable: LockedDisable) => (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element) || isDisabledFromLocked(lockedDisable));
  const onSetupPasteable = (getClipboardData: () => (SugarElement[]) | null) => (api: UiApi) =>
    onSetup(api, (targets) => isCaption(targets.element) || getClipboardData() === null);
  const onSetupPasteableColumn = (getClipboardData: () => (SugarElement[]) | null, lockedDisable: LockedDisable) => (api: UiApi) =>
    onSetup(api, (targets) => isCaption(targets.element) || getClipboardData() === null || isDisabledFromLocked(lockedDisable));
  const onSetupMergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('mergeable'));
  const onSetupUnmergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('unmergeable'));

  const onSetupTableWithCaption = (api: UiToggleApi) => {
    return onSetupWithToggle(api, (() => false as const), (targets) => {
      const tableOpt = TableLookup.table(targets.element, Utils.getIsRoot(editor));
      return tableOpt.exists((table) => SelectorExists.child(table, 'caption'));
    });
  };

  const onSetupTableHeaders = (command: string, headerType: 'header' | 'th') =>
    (api: UiToggleApi): () => void => {
      return onSetupWithToggle(api,
        (targets) => isCaption(targets.element),
        () => editor.queryCommandValue(command) === headerType
      );
    };

  const onSetupTableRowHeaders = onSetupTableHeaders('mceTableRowType', 'header');

  const onSetupTableColumnHeaders = onSetupTableHeaders('mceTableColType', 'th');

  editor.on('NodeChange ExecCommand TableSelectorChange', resetTargets);

  return {
    onSetupTable,
    onSetupCellOrRow,
    onSetupColumn,
    onSetupPasteable,
    onSetupPasteableColumn,
    onSetupMergeable,
    onSetupUnmergeable,
    resetTargets,
    onSetupTableWithCaption,
    onSetupTableRowHeaders,
    onSetupTableColumnHeaders,
    targets: targets.get
  };
};
