import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import { Optional } from 'ephox/katamari/api/Optional';

describe('atomic.katamari.api.optional.OptionalIsNoneTest', () => {
  it('Optional.isNone', () => {
    assert.isTrue(null === null);
    fc.assert(fc.property(fc.anything(), (x) => {
      assert.isFalse(x === null);
    }));
  });
});
