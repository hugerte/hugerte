import { Assert, UnitTest } from '@hugemce/bedrock-client';
import { Fun, Optional } from '@hugemce/katamari';
import { Html, Insert, SugarElement } from '@hugemce/sugar';

import { CellData } from 'hugemce/snooker/api/Generators';
import * as TableFill from 'hugemce/snooker/api/TableFill';

UnitTest.test('CloneFormatsTest', () => {
  const doc = SugarElement.fromDom(document);
  const noCloneFormats = Optional.some([] as string[]);
  const cloneTableFill = TableFill.cellOperations(Fun.noop, doc, Optional.none());
  const noCloneTableFill = TableFill.cellOperations(Fun.noop, doc, noCloneFormats);

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
