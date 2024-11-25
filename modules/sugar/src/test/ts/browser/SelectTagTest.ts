import { UnitTest } from '@ephox/bedrock-client';
import { KAssert } from "@hugerte/katamari-assertions";

import { SugarElement } from "hugerte/sugar/api/node/SugarElement";
import * as Select from "hugerte/sugar/api/tag/SelectTag";

UnitTest.test('SelectTagTest', () => {
  const select = SugarElement.fromHtml<HTMLSelectElement>('<select><option selected="selected" value="myvalue">valx</option><option value="non selected">valy</option></select>');
  const selectVal = Select.getValue(select);
  KAssert.eqSome('eq', 'myvalue', selectVal);

  const emptySelect = SugarElement.fromHtml<HTMLSelectElement>('<select></select>');
  const emptySelectVal = Select.getValue(emptySelect);
  KAssert.eqNone('eq', emptySelectVal);
});
