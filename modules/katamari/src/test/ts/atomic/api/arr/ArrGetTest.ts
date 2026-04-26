import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.ArrGetTest', () => {
  it('returns none for element of empty list', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertNone(([][n] ?? null));
    }));
  });

  it('returns none for element 0 of empty list', () => {
    assertNone(([][0] ?? null));
  });

  it('returns none for non-zero index of empty list', () => {
    assertNone(([][5] ?? null));
  });

  it('returns none for invalid index', () => {
    assertNone(([][-1] ?? null));
  });

  it('returns none for index out of bounds', () => {
    assertNone(([ 10, 20, 30 ][5] ?? null));
  });

  it('returns some for valid index (unit test)', () => {
    assertSome(([ 10, 20, 30, 13 ][3] ?? null), 13);
  });

  it('returns some for valid index (property test)', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.integer(), (array, h, t) => {
      const arr = [ h ].concat(array);
      const length = arr.push(t);
      const midIndex = Math.round(arr.length / 2);

      assertSome((arr[0] ?? null), h);
      assertSome((arr[midIndex] ?? null), arr[midIndex]);
      assertSome((arr[length - 1] ?? null), t);
    }));
  });
});
