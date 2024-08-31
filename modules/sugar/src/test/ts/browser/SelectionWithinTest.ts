import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj } from '@hugemce/katamari';

import * as InsertAll from 'hugemce/sugar/api/dom/InsertAll';
import * as Remove from 'hugemce/sugar/api/dom/Remove';
import * as SugarBody from 'hugemce/sugar/api/node/SugarBody';
import { SugarElement } from 'hugemce/sugar/api/node/SugarElement';
import * as SugarNode from 'hugemce/sugar/api/node/SugarNode';
import * as Html from 'hugemce/sugar/api/properties/Html';
import { SimSelection } from 'hugemce/sugar/api/selection/SimSelection';
import * as WindowSelection from 'hugemce/sugar/api/selection/WindowSelection';

UnitTest.test('Browser Test: SelectionTest', () => {
  const p1 = SugarElement.fromHtml('<p>This is the <strong>first</strong> paragraph</p>');
  const p2 = SugarElement.fromHtml('<p>This is the <em>second</em> paragraph</p>');

  InsertAll.append(SugarBody.body(), [ p1, p2 ]);

  const assertWithin = (expected: Record<string, number>, outer: SugarElement<Node>) => {
    WindowSelection.setToElement(window, outer);
    WindowSelection.getExact(window).fold(() => {
      Assert.fail('Selection should be wrapping: ' + Html.getOuter(outer));
    }, (sel) => {
      Obj.each(expected, (num, tag) => {
        const actual = WindowSelection.findWithin(
          window,
          SimSelection.exact(sel.start, sel.soffset, sel.finish, sel.foffset),
          tag
        );
        Assert.eq('Incorrect number of ' + tag + ' tags.\n' + 'Expected: ' + num + ', but was: ' + actual.length, num, actual.length);
        Assert.eq('All tags must be: ' + tag, true, Arr.forall(actual, (a) => SugarNode.name(a) === tag));
      });
    });
  };

  assertWithin({
    strong: 1,
    em: 0
  }, p1);

  assertWithin({
    strong: 0,
    em: 1
  }, p2);

  Remove.remove(p1);
  Remove.remove(p2);
});
