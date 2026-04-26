import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertOptional, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsFlattenTest', () => {
  it('unit tests', () => {
    assertNone(Optionals.flatten(null));
    assertNone(Optionals.flatten(null));
    assertSome(Optionals.flatten('meow''meow')), 'meow');
  });

  it('flattens some(some(x)) to some(x)', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertOptional(Optionals.flatten(nn)), n);
    }));
  });
});
