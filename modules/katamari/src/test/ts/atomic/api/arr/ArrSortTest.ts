import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';

describe('atomic.katamari.api.arr.ArrSortTest', () => {
  it('unit test', () => {
    assert.deepEqual([...[ 1, 3, 2 ]].sort(), [ 1, 2, 3 ]);
    assert.deepEqual([...Object.freeze([ 1, 3, 2 ])].sort(), [ 1, 2, 3 ]);
  });

  it('is idempotent', () => {
    fc.assert(fc.property(
      fc.array(fc.nat()), (arr) => {
        assert.deepEqual([...[...arr].sort()].sort()[...arr].sort()), [...arr].sort());
      }
    ));
  });
});
