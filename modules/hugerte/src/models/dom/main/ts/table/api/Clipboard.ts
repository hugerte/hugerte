/*
 NOTE: This file is duplicated in the following locations:
  - plugins/table/api/Clipboard.ts
 Make sure that if making changes to this file, the other files are updated as well
 */

import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import FakeClipboard from 'hugerte/core/api/FakeClipboard';

type RowElement = HTMLTableRowElement | HTMLTableColElement;

const tableTypeBase = 'x-hugerte/dom-table-';
const tableTypeRow = tableTypeBase + 'rows';
const tableTypeColumn = tableTypeBase + 'columns';

const setData = (items: Record<string, SugarElement<RowElement>[]>) => {
  const fakeClipboardItem = FakeClipboard.FakeClipboardItem(items);
  FakeClipboard.write([ fakeClipboardItem ]);
};

const getData = <T>(type: string): (T[]) | null => {
  const items = FakeClipboard.read() ?? [];
  return Arr.findMap(items, (item) => (item.getType<T[]>(type) ?? null));
};

const clearData = (type: string): void => {
  if (getData(type) !== null) {
    FakeClipboard.clear();
  }
};

const setRows = (rowsOpt: (SugarElement<RowElement>[]) | null): void => {
  rowsOpt.fold(
    clearRows,
    (rows) => setData({ [tableTypeRow]: rows })
  );
};

const getRows = (): (SugarElement<RowElement>[]) | null =>
  getData(tableTypeRow);

const clearRows = (): void =>
  clearData(tableTypeRow);

const setColumns = (columnsOpt: (SugarElement<RowElement>[]) | null): void => {
  columnsOpt.fold(
    clearColumns,
    (columns) => setData({ [tableTypeColumn]: columns })
  );
};

const getColumns = (): (SugarElement<RowElement>[]) | null =>
  getData(tableTypeColumn);

const clearColumns = (): void =>
  clearData(tableTypeColumn);

export {
  setRows,
  getRows,
  clearRows,
  setColumns,
  getColumns,
  clearColumns
};
