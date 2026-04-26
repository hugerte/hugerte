import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';

describe('atomic.katamari.api.arr.ReverseTest', () => {
  it('unit tests', () => {
    const check = <T>(expected: T[], input: T[]) => {
      assert.deepEqual([...input].reverse(), expected);
      assert.deepEqual([...Object.freeze(input.slice())].reverse(), expected);
    };

    check([], []);
    check([ 1 ], [ 1 ]);
    check([ 1, 2 ], [ 2, 1 ]);
    check([ 2, 1 ], [ 1, 2 ]);
    check([ 1, 4, 5, 3, 2 ], [ 2, 3, 5, 4, 1 ]);
  });

  it('Reversing twice is identity', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      assert.deepEqual([...[...arr].reverse()].reverse(), arr);
    }));
  });

  it('reversing a one element array is identity', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (a) => {
      assert.deepEqual([...[ a ]].reverse(), [ a ]);
    }));
  });

  it('reverses 2 elements', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      assert.deepEqual([...[ a, b ]].reverse(), [ b, a ]);
    }));
  });

  it('reverses 3 elements', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) => {
      assert.deepEqual([...[ a, b, c ]].reverse(), [ c, b, a ]);
    }));
  });

  it('every element in the input is in the output, and vice-versa', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (xs) => {
      const rxs = [...xs].reverse();
      assert.isTrue(rxs.every((x) => xs.includes(x)));
      assert.isTrue(xs.every((x) => rxs.includes(x)));
    }));
  });
});
