import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Insert from "hugerte/sugar/api/dom/Insert";
import * as Html from "hugerte/sugar/api/properties/Html";
import Div from "hugerte/sugar/test/Div";

UnitTest.test('HtmlTest', () => {
  // checks that Html.getOuter does not fiddle with the dom
  const c = Div();
  const container = Div();
  Insert.append(container, c);
  Assert.eq('', '<div></div>', Html.getOuter(c));

  Assert.eq('getOuter must not change the DOM', true, c.dom.parentNode === container.dom);

  const content = '<p>stuff</p>';
  Html.set(c, content);
  Assert.eq('', content, c.dom.innerHTML);
  Assert.eq('', content, Html.get(c));
});
