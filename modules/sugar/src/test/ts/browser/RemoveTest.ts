import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Insert from "hugerte/sugar/api/dom/Insert";
import * as Remove from "hugerte/sugar/api/dom/Remove";
import * as SugarBody from "hugerte/sugar/api/node/SugarBody";
import { SugarElement } from "hugerte/sugar/api/node/SugarElement";
import * as Class from "hugerte/sugar/api/properties/Class";
import * as Classes from "hugerte/sugar/api/properties/Classes";
import * as Html from "hugerte/sugar/api/properties/Html";
import * as Traverse from "hugerte/sugar/api/search/Traverse";
import Div from "hugerte/sugar/test/Div";
import EphoxElement from "hugerte/sugar/test/EphoxElement";

UnitTest.test('RemoveTest', () => {
  const runChecks = (connected: boolean) => {
    const container = Div();
    const span = EphoxElement('span');
    const li2 = EphoxElement('li');
    const li3 = EphoxElement('li');
    const li4 = EphoxElement('li');
    const li0 = EphoxElement('li');
    Classes.add(li2, [ 'second', 'third' ]);
    Class.add(li3, 'l3');
    Class.add(li4, 'l4');
    Class.add(li0, 'l0');
    const p = EphoxElement('p');
    const p2 = EphoxElement('p');

    Insert.append(container, p);
    Insert.append(container, p2);
    Insert.append(p, span);

    if (connected) {
      Insert.append(SugarBody.body(), container);
    }

    Assert.eq('', '<p><span></span></p><p></p>', Html.get(container));
    Remove.remove(p2);
    Assert.eq('', '<p><span></span></p>', Html.get(container));
    Insert.append(container, p2);
    Assert.eq('', '<p><span></span></p><p></p>', Html.get(container));
    Remove.remove(span);
    Assert.eq('', '<p></p><p></p>', Html.get(container));
    Remove.empty(container);

    // regular empty check
    Assert.eq('', '', Html.get(container));
    Assert.eq('', 0, Traverse.children(container).length);

    // after inserting an empty text node, empty doesn't always mean empty!
    Insert.append(container, SugarElement.fromText(''));
    Remove.empty(container);
    Assert.eq('', '', Html.get(container));
    Assert.eq('', 0, Traverse.children(container).length);

    Remove.remove(container);
  };

  runChecks(false);
  runChecks(true);
});
