import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.ObjEachTest', () => {
  it('ObjEachTest', () => {
    const check = <T>(expected: Array<{ index: string; value: T }>, input: Record<string, T>) => {
      const values: Array<{ index: string; value: T }> = [];
      Object.entries(input).forEach(([k, v]) => ((x, i) => {
        values.push({ index: i, value: x });
      })(v as any, k as any));
      assert.deepEqual(values, expected);
    };

    check([], {});
    check([{ index: 'a', value: 'A' }], { a: 'A' });
    check([{ index: 'a', value: 'A' }, { index: 'b', value: 'B' }, { index: 'c', value: 'C' }], {
      a: 'A',
      b: 'B',
      c: 'C'
    });
  });

  it('Each + set should equal the same object', () => {
    fc.assert(fc.property(
      fc.dictionary(fc.asciiString(), fc.json()),
      (obj) => {
        const values: Record<string, string> = {};
        const output = Object.entries(obj).forEach(([k, v]) => ((x, i) => {
          values[i] = x;
        })(v as any, k as any));
        assert.deepEqual(values, obj);
        assert.isUndefined(output);
      }
    ));
  });
});
