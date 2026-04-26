import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.arr.ObjSizeTest', () => {
  it('unit tests', () => {
    const check = (expected: number, input: Record<string, string>) => {
      assert.deepEqual(Object.keys(input).length, expected);
    };

    check(0, {});
    check(1, { a: 'a' });
    check(3, { a: 'a', b: 'b', c: 'c' });
  });

  it('inductive case', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(1, 30), fc.integer()),
      fc.asciiString(1, 30),
      fc.integer(),
      (obj, k, v) => {
        const objWithoutK = Object.fromEntries(Object.entries(obj).filter(([k, v]) => ((x, i) => i !== k)(v as any, k as any)));
        assert.deepEqual(Object.keys({ [k]: v, ...objWithoutK }).length, Object.keys(objWithoutK).length + 1);
      }), {
      numRuns: 5000
    });
  });
});
