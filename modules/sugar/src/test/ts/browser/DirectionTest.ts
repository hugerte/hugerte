import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Insert from "hugerte/sugar/api/dom/Insert";
import * as Remove from "hugerte/sugar/api/dom/Remove";
import * as SugarBody from "hugerte/sugar/api/node/SugarBody";
import { SugarElement } from "hugerte/sugar/api/node/SugarElement";
import * as Attribute from "hugerte/sugar/api/properties/Attribute";
import * as Direction from "hugerte/sugar/api/properties/Direction";
import EphoxElement from "hugerte/sugar/test/EphoxElement";

UnitTest.test('DirectionTest', () => {
  const el = EphoxElement('div');
  const body = SugarBody.body();

  const appendToDom = (element: SugarElement<Element>) => {
    Insert.append(body, element);
  };

  const assertDirection = (element: SugarElement<Element>, expectedDirection: 'ltr' | 'rtl') => {
    appendToDom(element);
    const dir = Direction.getDirection(element);
    Assert.eq('', expectedDirection, dir);
    Remove.remove(element);
  };

  const assertOnDirection = (element: SugarElement<Element>, isLeftReturnThis: string, isRightReturnThis: string, expectedOn: string) => {
    appendToDom(element);
    const onDirection = Direction.onDirection(isLeftReturnThis, isRightReturnThis);
    Assert.eq('', expectedOn, onDirection(element));
    Remove.remove(element);
  };

  assertDirection(el, 'ltr');
  assertOnDirection(el, 'isLeft', 'isRight', 'isLeft');

  const arabicElement = EphoxElement('div');
  Attribute.setAll(arabicElement, { lang: 'ar', dir: 'rtl' });
  assertDirection(arabicElement, 'rtl');
  assertOnDirection(arabicElement, 'isLeft', 'isRight', 'isRight');
});
