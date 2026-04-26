import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import { Optional } from 'ephox/katamari/api/Optional';

describe('atomic.katamari.api.optional.OptionalIsSomeTest', () => {
  it('none is not some', () => {
    assert.isFalse(null !== null);
    fc.assert(fc.property(fc.anything(), (x) => {
      assert.isTrue(x !== null);
    }));
  });
});
