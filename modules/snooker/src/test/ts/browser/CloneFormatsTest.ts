import { Assert, UnitTest } from '@ephox/bedrock-client';

import { Html, Insert, SugarElement } from '@ephox/sugar';

import { CellData } from 'ephox/snooker/api/Generators';
import * as TableFill from 'ephox/snooker/api/TableFill';

UnitTest.test('CloneFormatsTest', () => {
  const doc = SugarElement.fromDom(document);
  const noCloneFormats = [] as string[];
  const cloneTableFill = TableFill.cellOperations(() => {}, doc, null);
  const noCloneTableFill = TableFill.cellOperations(() => {}, doc, noCloneFormats);

  const createCell = (content: string): CellData => {
    const cellElement = SugarElement.fromTag('td');
    const cellContent = SugarElement.fromHtml(content);
    Insert.append(cellElement, cellContent);
    return {
      element: cellElement,
      colspan: 1,
      rowspan: 1
    };
  };

  const testClonedCell = (content: string, expected: string) => {
    const cell = createCell(content);
    const clonedCell = cloneTableFill.cell(cell);
    Assert.eq('', expected, Html.getOuter(clonedCell));
    const noClonedCell = noCloneTableFill.cell(cell);
    Assert.eq('', '<td><br></td>', Html.getOuter(noClonedCell));
  };

  testClonedCell('<strong contenteditable="false"><em>stuff</em></strong>', '<td><br></td>');
  testClonedCell('<strong><em contenteditable="false">stuff</em></strong>', '<td><strong><br></strong></td>');
});
