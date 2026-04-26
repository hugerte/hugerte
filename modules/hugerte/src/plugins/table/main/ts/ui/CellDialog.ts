import { Obj } from '@ephox/katamari';
import { TableLookup, Warehouse } from '@ephox/snooker';
import { Compare, SugarElement } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';
import { Dialog } from 'hugerte/core/api/ui/Ui';

import * as Styles from '../actions/Styles';
import * as Events from '../api/Events';
import * as Options from '../api/Options';
import * as Utils from '../core/Utils';
import * as TableSelection from '../selection/TableSelection';
import * as CellDialogGeneralTab from './CellDialogGeneralTab';
import { getAdvancedTab } from './DialogAdvancedTab';
import { DomModifier } from './DomModifier';
import * as Helpers from './Helpers';

type CellData = Helpers.CellData;

interface SelectedCell {
  readonly element: HTMLTableCellElement;
  readonly column: (HTMLTableColElement) | null;
}

const getSelectedCells = (table: SugarElement<HTMLTableElement>, cells: SugarElement<HTMLTableCellElement>[]): SelectedCell[] => {
  const warehouse = Warehouse.fromTable(table);
  const allCells = Warehouse.justCells(warehouse);

  const filtered = (allCells).filter((cellA) =>
    (cells).some((cellB) =>
      Compare.eq(cellA.element, cellB)));

  return (filtered).map((cell) => ({
    element: cell.element.dom,
    column: Warehouse.getColumnAt(warehouse, cell.column).map((col) => col.element.dom)
  }));
};

const updateSimpleProps = (modifier: DomModifier, colModifier: DomModifier, data: CellData, shouldUpdate: (key: string) => boolean): void => {
  if (shouldUpdate('scope')) {
    modifier.setAttrib('scope', data.scope);
  }
  if (shouldUpdate('class') && data.class !== 'mce-no-match') {
    modifier.setAttrib('class', data.class);
  }
  if (shouldUpdate('width')) {
    colModifier.setStyle('width', Utils.addPxSuffix(data.width));
  }
};

const updateAdvancedProps = (modifier: DomModifier, data: Required<CellData>, shouldUpdate: (key: string) => boolean): void => {
  if (shouldUpdate('backgroundcolor')) {
    modifier.setFormat('tablecellbackgroundcolor', data.backgroundcolor);
  }
  if (shouldUpdate('bordercolor')) {
    modifier.setFormat('tablecellbordercolor', data.bordercolor);
  }
  if (shouldUpdate('borderstyle')) {
    modifier.setFormat('tablecellborderstyle', data.borderstyle);
  }
  if (shouldUpdate('borderwidth')) {
    modifier.setFormat('tablecellborderwidth', Utils.addPxSuffix(data.borderwidth));
  }
};

const applyStyleData = (editor: Editor, cells: SelectedCell[], data: CellData, wasChanged: (key: string) => boolean): void => {
  const isSingleCell = cells.length === 1;
  (cells).forEach((item) => {
    const cellElm = item.element;
    const shouldOverrideCurrentValue = isSingleCell ? (() => true as const) : wasChanged;
    const modifier = DomModifier.normal(editor, cellElm);
    const colModifier = item.column.map((col) => DomModifier.normal(editor, col)) ?? (modifier);

    updateSimpleProps(modifier, colModifier, data, shouldOverrideCurrentValue);

    if (Options.hasAdvancedCellTab(editor)) {
      updateAdvancedProps(modifier, data as Required<CellData>, shouldOverrideCurrentValue);
    }

    // Apply alignment
    if (wasChanged('halign')) {
      Styles.setAlign(editor, cellElm, data.halign);
    }

    // Apply vertical alignment
    if (wasChanged('valign')) {
      Styles.setVAlign(editor, cellElm, data.valign);
    }
  });
};

const applyStructureData = (editor: Editor, data: CellData): void => {
  // Switch cell type if applicable. Note that we specifically tell the command to not fire events
  // as we'll batch the events and fire a `TableModified` event at the end of the updates.
  editor.execCommand('mceTableCellType', false, { type: data.celltype, no_events: true });
};

const applyCellData = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[], oldData: CellData, data: CellData): void => {
  const modifiedData = Object.fromEntries(Object.entries(data).filter(([_k, _v]: [any, any]) => ((value, key) => oldData[key as keyof CellData] !== value)(_v, _k as any)));

  if (Object.keys(modifiedData).length > 0 && cells.length >= 1) {
    // Retrieve the table before the cells are modified as there is a case where cells
    // are replaced and the reference will be lost when trying to fire events.
    TableLookup.table(cells[0]).each((table) => {
      const selectedCells = getSelectedCells(table, cells);

      // style modified if there's at least one other change apart from 'celltype' and 'scope'
      const styleModified = Object.keys(Object.fromEntries(Object.entries(modifiedData).filter(([_k, _v]: [any, any]) => ((_value, key) => key !== 'scope' && key !== 'celltype')(_v, _k as any)))).length > 0;
      const structureModified = Object.prototype.hasOwnProperty.call(modifiedData, 'celltype');

      // Update the cells styling using the dialog data
      if (styleModified || Object.prototype.hasOwnProperty.call(modifiedData, 'scope')) {
        applyStyleData(editor, selectedCells, data, ((..._rest: any[]) => (Obj.has)(modifiedData, ..._rest)));
      }

      // Update the cells structure using the dialog data
      if (structureModified) {
        applyStructureData(editor, data);
      }

      Events.fireTableModified(editor, table.dom, {
        structure: structureModified,
        style: styleModified,
      });
    });
  }
};

const onSubmitCellForm = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[], oldData: CellData, api: Dialog.DialogInstanceApi<CellData>): void => {
  const data = api.getData();
  api.close();

  editor.undoManager.transact(() => {
    applyCellData(editor, cells, oldData, data);
    editor.focus();
  });
};

const getData = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[]): CellData => {
  const cellsData = TableLookup.table(cells[0]).map((table) =>
    (getSelectedCells(table, cells)).map((item) =>
      Helpers.extractDataFromCellElement(editor, item.element, Options.hasAdvancedCellTab(editor), item.column))
  );

  return Helpers.getSharedValues<CellData>(cellsData.getOrDie());
};

const open = (editor: Editor): void => {
  const cells = TableSelection.getCellsFromSelection(editor);

  // Check if there are any cells to operate on
  if (cells.length === 0) {
    return;
  }

  const data = getData(editor, cells);

  const dialogTabPanel: Dialog.TabPanelSpec = {
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: CellDialogGeneralTab.getItems(editor)
      },
      getAdvancedTab(editor, 'cell')
    ]
  };
  const dialogPanel: Dialog.PanelSpec = {
    type: 'panel',
    items: [
      {
        type: 'grid',
        columns: 2,
        items: CellDialogGeneralTab.getItems(editor)
      }
    ]
  };
  editor.windowManager.open({
    title: 'Cell Properties',
    size: 'normal',
    body: Options.hasAdvancedCellTab(editor) ? dialogTabPanel : dialogPanel,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData: data,
    onSubmit: ((..._rest: any[]) => (onSubmitCellForm)(editor, cells, data, ..._rest))
  });
};

export { open };
