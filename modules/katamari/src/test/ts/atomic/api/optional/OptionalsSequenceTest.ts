import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsSequenceTest', () => {
  it('unit tests', () => {
    assertOptional(Optionals.sequence<number>([]), []);
    assertOptional(Optionals.sequence<number>([ 3 ]), [ 3 ]);
    assertOptional(Optionals.sequence<number>([ 1, 2 ]), [ 1, 2 ]);

    assertNone(Optionals.sequence<number>([ 1, null ]));
    assertNone(Optionals.sequence<number>([ null, 343 ]));
  });

  it('Single some value', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertOptional(Optionals.sequence([ n ]), [ n ]);
    }));
  });

  it('Two some values', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (n, m) => {
      assertOptional(Optionals.sequence<number>([ n, m ]), [ n, m ]);
    }));
  });

  it('Array of numbers', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (n) => {
      const someNumbers = Arr.map(n, (x) => x);
      assertOptional(Optionals.sequence<number>(someNumbers), n);
    }));
  });

  it('Some then none', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (n) => {
      const someNumbers = Arr.map(n, (x) => x);
      assertNone(Optionals.sequence<number>([ ...someNumbers, null ]));
    }));
  });

  it('None then some', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (n) => {
      const someNumbers = Arr.map(n, (x) => x);
      assertNone(Optionals.sequence<number>([ null, ...someNumbers ]));
    }));
  });

  it('all some', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (n) =>
      assertOptional(Optionals.sequence<number>(Arr.map(n, (x) => x)), Optionals.traverse<number, number>(n, (x) => x))
    ));
  });
});
