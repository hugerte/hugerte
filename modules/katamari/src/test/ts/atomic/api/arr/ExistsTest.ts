import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import { never, always } from 'ephox/katamari/api/Fun';

const eqc = <T>(x: T) => (a: T) => x === a;
const bottom = () => {
  throw new Error('error');
};

describe('atomic.katamari.api.arr.ExistsTest', () => {
  it('unit test', () => {
    const check = (expected: boolean, input: number[], f: (b: number) => boolean) => {
      assert.deepEqual(input.some(f), expected);
      assert.deepEqual(Object.freeze(input.slice()).some(f), expected);
    };

    check(true, [ 1, 2, 3 ], eqc(1));
    check(false, [ 2, 3, 4 ], eqc(1));

    assert.isFalse([].some(bottom));
    assert.isFalse([].some(always));
  });

  it('Element exists in middle of array', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.array(fc.integer()), (prefix, element, suffix) => {
      const arr2 = [ prefix, [ element ], suffix ].flat();
      assert.isTrue(arr2.some(eqc(element)));
    }));
  });

  it('Element exists in singleton array of itself', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (i) => {
      assert.isTrue([ i ].some(eqc(i)));
    }));
  });

  it('Element does not exist in empty array', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (i) => {
      assert.isFalse([].some(eqc(i)));
    }));
  });

  it('Element not found when predicate always returns false', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => !arr.some(never)));
  });

  it('Element exists in non-empty array when predicate always returns true', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (xs, x) => {
      const arr = [ xs, [ x ]].flat();
      assert.isTrue(arr.some(always));
    }));
  });
});
