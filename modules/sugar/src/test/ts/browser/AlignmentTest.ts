import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Insert from "hugerte/sugar/api/dom/Insert";
import * as Remove from "hugerte/sugar/api/dom/Remove";
import * as SugarBody from "hugerte/sugar/api/node/SugarBody";
import { SugarElement } from "hugerte/sugar/api/node/SugarElement";
import * as Alignment from "hugerte/sugar/api/properties/Alignment";
import * as Attribute from "hugerte/sugar/api/properties/Attribute";
import * as Traverse from "hugerte/sugar/api/search/Traverse";
import EphoxElement from "hugerte/sugar/test/EphoxElement";

UnitTest.test('AlignmentTest', () => {
  const body = SugarBody.body();
  const createDirectionalP = (direction: 'ltr' | 'rtl') => {
    const divEl = EphoxElement('div');
    const par = EphoxElement('p');
    Attribute.setAll(divEl, { dir: direction });
    Insert.append(body, divEl);
    Insert.append(divEl, par);
    return par;
  };

  const check = (element: SugarElement<Element> | SugarElement<Text>, property: string, value: string, expected: boolean) => {
    const res = Alignment.hasAlignment(element, property, value);
    Assert.eq('', expected, res);
    Traverse.parent(element).each(Remove.remove);
  };

  const rtlP = createDirectionalP('rtl');
  check(rtlP, 'text-align', 'left', false);
  const rtlIsRight = createDirectionalP('rtl');
  check(rtlIsRight, 'text-align', 'right', true);

  /* should never be checking alignment on a text node */
  check(SugarElement.fromText('Bacon eatsum'), 'text-align', 'left', false);
});
