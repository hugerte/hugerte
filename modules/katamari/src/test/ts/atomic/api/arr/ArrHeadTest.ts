import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import { assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.ArrHeadTest', () => {
  it('returns none when empty', () => {
    assert.isTrue(([][0] ?? null) === null);
  });

  it('returns first element when nonEmpty', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (t, h) => {
      const arr = [ h, ...t ];
      assertSome((arr[0] ?? null), h);
    }));
  });
});
