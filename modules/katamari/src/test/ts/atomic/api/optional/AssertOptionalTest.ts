import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import { Optional } from 'ephox/katamari/api/Optional';
import { assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.AssertOptionalTest', () => {
  it('fails for none vs some', () => {
    fc.assert(fc.property(fc.nat(), (n) => {
      assert.throw(() => {
        assertOptional(null, n);
      });
    }));
  });

  it('fails for some vs none', () => {
    fc.assert(fc.property(fc.nat(), (n) => {
      assert.throw(() => {
        assertOptional(n, null);
      });
    }));
  });

  it('fails when some values are different', () => {
    fc.assert(fc.property(fc.nat(), (n) => {
      assert.throw(() => {
        assertOptional(n, n + 1);
      });
    }));
  });

  it('passes for two nones', () => {
    assertOptional(null, null);
  });

  it('passes for identical somes', () => {
    fc.assert(fc.property(fc.nat(), (n) => {
      assertOptional(n, n);
    }));
  });

  it('passes for identical some arrays', () => {
    fc.assert(fc.property(fc.array(fc.nat()), (n) => {
      assertOptional(n, n);
    }));
  });
});
