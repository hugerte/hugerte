import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';

describe('atomic.katamari.api.arr.DifferenceTest', () => {
  it('unit tests', () => {
    const check = <T>(expected: T[], a1: T[], a2: T[]) => {
      const readonlyA1 = Object.freeze(a1.slice());
      const readonlyA2 = Object.freeze(a2.slice());
      assert.deepEqual(a1.filter((x) => !a2.includes(x)), expected);
      assert.deepEqual(readonlyA1.filter((x) => !a2.includes(x)), expected);
      assert.deepEqual(a1.filter((x) => !readonlyA2.includes(x)), expected);
      assert.deepEqual(readonlyA1.filter((x) => !readonlyA2.includes(x)), expected);
    };

    check([], [], []);
    check([ 1 ], [ 1 ], []);
    check([ 1, 2, 3 ], [ 1, 2, 3 ], []);
    check([], [], [ 1, 2, 3 ]);
    check([], [ 1, 2, 3 ], [ 1, 2, 3 ]);
    check([ 1, 3 ], [ 1, 2, 3, 4 ], [ 2, 4 ]);
    check([ 1 ], [ 1, 2, 3 ], [ 3, 2 ]);
    check([ 2 ], [ 1, 2, 3, 4 ], [ 3, 4, 5, 1, 10, 10000, 56 ]);
  });

  it('ys-xs contains no elements from xs', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (xs, ys) => {
      const diff = ys.filter((x) => !xs.includes(x));
      return xs.every((x) => !diff.includes(x));
    }));
  });

  it('every member of ys-xs is in ys', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (xs, ys) => {
      const diff = ys.filter((x) => !xs.includes(x));
      return diff.every((d) => ys.includes(d));
    }));
  });
});
