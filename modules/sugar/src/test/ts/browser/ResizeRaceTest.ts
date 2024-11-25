import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from "@hugerte/katamari";

import * as Insert from "hugerte/sugar/api/dom/Insert";
import * as Remove from "hugerte/sugar/api/dom/Remove";
import * as Resize from "hugerte/sugar/api/events/Resize";
import * as SugarBody from "hugerte/sugar/api/node/SugarBody";
import { SugarElement } from "hugerte/sugar/api/node/SugarElement";
import * as Monitors from "hugerte/sugar/impl/Monitors";

UnitTest.asynctest('ResizeRaceTest', (success, failure) => {

  const div = SugarElement.fromTag('div');
  Insert.append(SugarBody.body(), div);

  const handler = Fun.noop;
  Resize.bind(div, handler);
  Remove.remove(div);
  Resize.unbind(div, handler);

  setTimeout(() => {
    if (Monitors.query(div).isSome()) {
      failure('Monitor added to div after resize was unbound');
    } else {
      success();
    }
  }, 150); // assumes the resize code still uses 100
});
