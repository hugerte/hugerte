import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.ArrBindTest', () => {
  it('unit tests', () => {
    const len = (x: unknown[]): number[] => [ x.length ];

    const check = <T, U>(expected: U[], input: T[][], f: (x: T[]) => U[]) => {
      assert.deepEqual(input.flatMap(f), expected);
      assert.deepEqual(Object.freeze(input.slice()).flatMap(f), expected);
    };

    check([], [], len);
    check([ 1 ], [[ 1 ]], len);
    check([ 1, 1 ], [[ 1 ], [ 2 ]], len);
    check([ 2, 0, 1, 2, 0 ], [[ 1, 2 ], [], [ 3 ], [ 4, 5 ], []], len);
  });

  it('binding an array of empty arrays with identity equals an empty array', () => {
    fc.assert(fc.property(fc.array(fc.constant<number[]>([])), (arr) => {
      assert.deepEqual(arr.flatMap(Fun.identity), []);
    }));
  });

  it('bind (pure .) is map', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, j) => {
      const f = (x: number) => x + j;
      assert.deepEqual(arr.flatMap(Fun.compose(Arr.pure, f)), arr.map(f));
    }));
  });

  context('monad laws', () => {
    it('obeys left identity law', () => {
      fc.assert(fc.property(fc.integer(), fc.integer(), (i, j) => {
        const f = (x: number) => [ x, j, x + j ];
        assert.deepEqual([i].flatMap(f), f(i));
      }));
    });

    it('obeys right identity law', () => {
      fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
        assert.deepEqual(arr.flatMap(Arr.pure), arr);
      }));
    });

    it('is associative', () => {
      fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, j) => {
        const f = (x: number) => [ x, j, x + j ];
        const g = (x: number) => [ j, x, x + j ];
        assert.deepEqual(arr.flatMap(f).flatMap(g), arr.flatMap((x) => f(x).flatMap(g)));
      }));
    });
  });
});
