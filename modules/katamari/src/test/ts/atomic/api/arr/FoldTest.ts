import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.FoldTest', () => {
  it('unit tests', () => {
    const checkl = <T, A>(expected: A, input: T[], f: (acc: A, x: T, i: number) => A, acc: A) => {
      assert.deepEqual(input.reduce(f, acc), expected);
      assert.deepEqual(Object.freeze(input.slice()).reduce(f, acc), expected);
    };

    const checkr = <T, A>(expected: A, input: T[], f: (acc: A, x: T, i: number) => A, acc: A) => {
      assert.deepEqual(input.reduceRight(f, acc), expected);
      assert.deepEqual(Object.freeze(input.slice()).reduceRight(f, acc), expected);
    };

    checkl(0, [], Fun.die('should not be called'), 0);
    checkl(6, [ 1, 2, 3 ], (acc, x) => acc + x, 0);
    checkl(13, [ 1, 2, 3 ], (acc, x) => acc + x, 7);
    // foldl with cons and [] should reverse the list
    checkl([ 3, 2, 1 ], [ 1, 2, 3 ], (acc, x) => [ x ].concat(acc), []);

    checkr(0, [], Fun.die('should not be called'), 0);
    checkr(6, [ 1, 2, 3 ], (acc, x) => acc + x, 0);
    checkr(13, [ 1, 2, 3 ], (acc, x) => acc + x, 7);
    // foldr with cons and [] should be identity
    checkr([ 1, 2, 3 ], [ 1, 2, 3 ], (acc, x) => [ x ].concat(acc), []);
  });

  it('foldl concat [ ] xs === reverse(xs)', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const output = arr.reduce((b: number[], a: number) => [ a ].concat(b), []);
        assert.deepEqual(output, [...arr].reverse());
      }
    ));
  });

  it('foldr concat [ ] xs === xs', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const output = arr.reduceRight((b: number[], a: number) => [ a ].concat(b), []);
        assert.deepEqual(output, arr);
      }
    ));
  });

  it('foldr concat ys xs === xs ++ ys', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.array(fc.integer()),
      (xs, ys) => {
        const output = xs.reduceRight((b, a) => [ a ].concat(b), ys);
        assert.deepEqual(output, xs.concat(ys));
      }
    ));
  });

  it('foldl concat ys xs === reverse(xs) ++ ys', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.array(fc.integer()),
      (xs, ys) => {
        const output = xs.reduce((b, a) => [ a ].concat(b), ys);
        assert.deepEqual(output, [...xs].reverse().concat(ys));
      }
    ));
  });
});
