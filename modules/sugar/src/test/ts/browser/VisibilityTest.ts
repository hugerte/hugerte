import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from "@hugerte/katamari";

import * as Insert from "hugerte/sugar/api/dom/Insert";
import * as Remove from "hugerte/sugar/api/dom/Remove";
import * as SugarBody from "hugerte/sugar/api/node/SugarBody";
import * as Css from "hugerte/sugar/api/properties/Css";
import * as Visibility from "hugerte/sugar/api/view/Visibility";
import Div from "hugerte/sugar/test/Div";

UnitTest.test('VisibilityTest', () => {
  const c = Div();
  Assert.eq('', false, Visibility.isVisible(c));
  Insert.append(SugarBody.body(), c);
  Assert.eq('', true, Visibility.isVisible(c));

  Css.set(c, 'display', 'none');
  Assert.eq('', false, Visibility.isVisible(c));

  // TODO: Disabled since it is flaking on Chrome sometimes it's hidden sometimes its not. #TINY-10485
  // const s = SugarElement.fromTag('span');
  // Assert.eq('', false, Visibility.isVisible(s));
  //
  // Insert.append(SugarBody.body(), s);
  // const expected = PlatformDetection.detect().browser.isFirefox();
  // Assert.eq('', expected, Visibility.isVisible(s)); // tricked you! height and width are zero == hidden

  const d = Div();
  Insert.append(c, d);
  Assert.eq('', false, Visibility.isVisible(d));

  Css.remove(c, 'display');
  Assert.eq('', true, Visibility.isVisible(d));
  Assert.eq('', true, Visibility.isVisible(c));

  Arr.each([ c, d ], Remove.remove);
});
