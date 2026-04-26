import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

const dbl = (x: number) => x * 2;

const plus3 = (x: number) => x + 3;

describe('atomic.katamari.api.arr.ArrMapTest', () => {
  it('unit tests', () => {
    const checkA = <T, U>(expected: U[], input: T[], f: (x: T, i: number) => U) => {
      assert.deepEqual(input.map(f), expected);
      assert.deepEqual(Object.freeze(input.slice()).map(f), expected);
    };

    checkA([], [], dbl);
    checkA([ 2 ], [ 1 ], dbl);
    checkA([ 4, 6, 10 ], [ 2, 3, 5 ], dbl);
  });

  context('functor laws', () => {
    it('obeys identity law', () => {
      fc.assert(fc.property(fc.array(fc.nat()), (xs) =>
        assert.deepEqual(xs.map(Fun.identity), xs)
      ));
    });

    it('obeys associative law', () => {
      const f = plus3;
      const g = dbl;

      fc.assert(fc.property(fc.array(fc.nat()), (xs) =>
        assert.deepEqual(xs.map(g).map(f)xs.map(g), f), xs.map(Fun.compose(f, g)))
      ));
    });
  });
});
