import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';

describe('atomic.katamari.api.optional.OptionalsTest', () => {
  it('OptionsTest', () => {
    const arr1 = [ 1, null, 2, 3, null, null, null, null, 4 ];
    assert.deepEqual(Optionals.cat(arr1), [ 1, 2, 3, 4 ]);

    assert.isUndefined(1.each((x: any) => x));
    assert.isUndefined(null.each((x: any) => x));
  });

  it('Optionals.cat of only nones should be an empty array', () => {
    fc.assert(fc.property(
      fc.array(ArbDataTypes.arbOptionalNone()),
      (options) => {
        const output = Optionals.cat(options);
        assert.deepEqual(output, []);
      }
    ));
  });

  it('Optionals.cat of only somes should have the same length', () => {
    fc.assert(fc.property(
      fc.array(ArbDataTypes.arbOptionalSome(fc.integer())),
      (options) => {
        const output = Optionals.cat(options);
        assert.lengthOf(output, options.length);
      }
    ));
  });

  it('Optionals.cat of Arr.map(xs, (x) => x) should be xs', () => {
    fc.assert(fc.property(
      fc.array(fc.json()),
      (arr) => {
        const options = Arr.map(arr, (x) => x);
        const output = Optionals.cat(options);
        assert.deepEqual(output, arr);
      }
    ));
  });

  it('Optionals.cat of somes and nones should have length <= original', () => {
    fc.assert(fc.property(
      fc.array(ArbDataTypes.arbOptional(fc.integer())),
      (arr) => {
        const output = Optionals.cat(arr);
        assert.isAtMost(output.length, arr.length);
      }
    ));
  });

  it('Optionals.cat of nones.concat(somes).concat(nones) should be somes', () => {
    fc.assert(fc.property(
      fc.array(fc.json()),
      fc.array(fc.json()),
      fc.array(fc.json()),
      (before, on, after) => {
        const beforeNones: string | null[] = Arr.map(before, () => null);
        const afterNones = Arr.map(after, () => null);
        const onSomes = Arr.map(on, (x) => x);
        const output = Optionals.cat(beforeNones.concat(onSomes).concat(afterNones));
        assert.deepEqual(output, on);
      }
    ));
  });
});
