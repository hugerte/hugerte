import { UnitTest } from '@hugemce/bedrock-client';
import { Fun } from '@hugemce/katamari';

import * as Insert from 'hugemce/sugar/api/dom/Insert';
import * as Remove from 'hugemce/sugar/api/dom/Remove';
import * as Resize from 'hugemce/sugar/api/events/Resize';
import * as SugarBody from 'hugemce/sugar/api/node/SugarBody';
import { SugarElement } from 'hugemce/sugar/api/node/SugarElement';
import * as Monitors from 'hugemce/sugar/impl/Monitors';

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
