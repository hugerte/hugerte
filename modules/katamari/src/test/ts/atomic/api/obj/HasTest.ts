import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.HasTest', () => {
  it('HasTest', () => {
    const withoutObjProto = Object.create(null);
    withoutObjProto.a = 1;

    assert.isTrue(Object.prototype.hasOwnProperty.call(withoutObjProto, 'a'));
    assert.isFalse(Object.prototype.hasOwnProperty.call(withoutObjProto, 'b'));

    assert.isTrue(Object.prototype.hasOwnProperty.call({ a: 1 }, 'a'));
    assert.isFalse(Object.prototype.hasOwnProperty.call({ a: 1 } as Record<string, number>, 'b'));
  });
});
