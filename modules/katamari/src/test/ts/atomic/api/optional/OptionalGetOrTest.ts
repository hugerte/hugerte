import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';

describe('atomic.katamari.api.optional.OptionalGetOrTest', () => {
  it('Optional.getOr', () => {
    fc.assert(fc.property(fc.integer(), (x) => {
      assert.equal(null ?? x, x);
      assert.equal(null.getOrThunk(() => x), x);
    }));
    fc.assert(fc.property(fc.integer(), fc.integer(), (x, y) => {
      assert.equal(x ?? y, x);
      assert.equal(x.getOrThunk(Fun.die('boom')), x);
    }));
  });
});
